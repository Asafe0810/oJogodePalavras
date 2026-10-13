import type { CompletedGame, StoredHistory } from "../domain/types";

const HISTORY_KEY = "word-game.history.v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface HistoryRepository {
  load(): StoredHistory;
  save(history: StoredHistory): boolean;
}

function getBrowserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isCompletedGame(value: unknown): value is CompletedGame {
  if (!value || typeof value !== "object") return false;
  const game = value as Partial<CompletedGame>;
  return game.schemaVersion === 1
    && typeof game.gameId === "string"
    && Number.isInteger(game.cycle)
    && (game.cycle as number) > 0
    && typeof game.wordId === "string"
    && typeof game.answerSnapshot === "string"
    && (game.language === "pt-BR" || game.language === "en")
    && typeof game.definitionSnapshot === "string"
    && Array.isArray(game.cluesShown)
    && game.cluesShown.every((clue) => typeof clue === "string")
    && Array.isArray(game.guesses)
    && game.guesses.every((guess) => Boolean(guess)
      && typeof guess.value === "string"
      && typeof guess.normalizedValue === "string"
      && typeof guess.correct === "boolean"
      && typeof guess.submittedAt === "string")
    && (game.outcome === "won" || game.outcome === "lost")
    && typeof game.completedAt === "string";
}

function emptyHistory(): StoredHistory {
  return { schemaVersion: 1, cycle: 1, entries: [] };
}

function parseHistory(raw: string | null): StoredHistory {
  if (!raw) return emptyHistory();
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return emptyHistory();
    const parsed = value as Partial<StoredHistory>;
    if (parsed.schemaVersion !== 1 || !Number.isInteger(parsed.cycle) || !Array.isArray(parsed.entries)) {
      return emptyHistory();
    }
    return {
      schemaVersion: 1,
      cycle: Math.max(1, parsed.cycle as number),
      entries: parsed.entries.filter(isCompletedGame),
    };
  } catch {
    return emptyHistory();
  }
}

export function createHistoryRepository(storage: StorageLike | null = getBrowserStorage()): HistoryRepository {
  return {
    load(): StoredHistory {
      if (!storage) return emptyHistory();
      try {
        return parseHistory(storage.getItem(HISTORY_KEY));
      } catch {
        return emptyHistory();
      }
    },
    save(history: StoredHistory): boolean {
      if (!storage) return false;
      try {
        storage.setItem(HISTORY_KEY, JSON.stringify(history));
        return true;
      } catch {
        return false;
      }
    },
  };
}

export { HISTORY_KEY };
