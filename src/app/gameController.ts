import { WORDS } from "../content/catalog";
import { createGame, getFeedback, submitGuess } from "../domain/gameRules";
import { selectNextWord } from "../domain/selectNextWord";
import type { CompletedGame, GameState, GuessOutcome, Language, StoredHistory, WordEntry } from "../domain/types";
import { createHistoryRepository, type HistoryRepository } from "../persistence/historyRepository";

export interface GameControllerOptions {
  random?: () => number;
  words?: readonly WordEntry[];
  repository?: HistoryRepository;
}

export interface AppSnapshot {
  game: GameState | null;
  history: StoredHistory;
  nextLanguage: Language;
  roundNumber: number;
  feedback: string;
  exhausted: boolean;
  historyAvailable: boolean;
  persistenceIssue: "save" | "clear" | "cycle" | null;
}

export class GameController {
  private readonly repository: HistoryRepository;
  private readonly random: () => number;
  private readonly words: readonly WordEntry[];
  private history: StoredHistory;
  private game: GameState | null = null;
  private currentRoundNumber = 1;
  private nextLanguage: Language = "pt-BR";
  private feedback = "";
  private historyAvailable = true;
  private persistenceIssue: AppSnapshot["persistenceIssue"] = null;
  private readonly listeners = new Set<(snapshot: AppSnapshot) => void>();

  constructor(options: GameControllerOptions = {}) {
    this.repository = options.repository ?? createHistoryRepository();
    this.random = options.random ?? Math.random;
    this.words = options.words ?? WORDS;
    this.history = this.repository.load();
  }

  subscribe(listener: (snapshot: AppSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): AppSnapshot {
    const roundNumber = this.game
      ? this.currentRoundNumber
      : this.history.entries.filter((entry) => entry.cycle === this.history.cycle).length + 1;
    return {
      game: this.game,
      history: this.history,
      nextLanguage: this.nextLanguage,
      roundNumber,
      feedback: this.feedback,
      exhausted: !this.game,
      historyAvailable: this.historyAvailable,
      persistenceIssue: this.persistenceIssue,
    };
  }

  startRound(): boolean {
    const word = selectNextWord(this.words, this.history.entries, this.nextLanguage, this.history.cycle, this.random);
    if (!word) {
      this.game = null;
      this.feedback = "";
      this.emit();
      return false;
    }
    this.game = createGame(word);
    this.currentRoundNumber = this.history.entries.filter((entry) => entry.cycle === this.history.cycle).length + 1;
    this.feedback = word.language === "en" ? "One clue to get started." : "Uma pista para começar.";
    this.emit();
    return true;
  }

  setNextLanguage(language: Language): void {
    this.nextLanguage = language;
    if (!this.game) {
      this.startRound();
      return;
    }
    this.emit();
  }

  submit(value: string): GuessOutcome {
    if (!this.game) return "closed";
    const result = submitGuess(this.game, value);
    this.game = result.state;
    const remaining = Math.max(0, 6 - this.game.guesses.length);
    this.feedback = getFeedback(result.outcome, remaining, this.game.language);

    if (result.outcome === "correct" || result.outcome === "lost") {
      this.history = {
        ...this.history,
        entries: [this.toCompletedGame(this.game), ...this.history.entries],
      };
      this.historyAvailable = this.repository.save(this.history);
      this.persistenceIssue = this.historyAvailable ? null : "save";
    }

    this.emit();
    return result.outcome;
  }

  beginNextCycle(): void {
    this.history = { ...this.history, cycle: this.history.cycle + 1 };
    this.historyAvailable = this.repository.save(this.history);
    this.persistenceIssue = this.historyAvailable ? null : "cycle";
    this.startRound();
  }

  clearHistory(): void {
    const hadActiveGame = Boolean(this.game);
    const clearedHistory: StoredHistory = { schemaVersion: 1, cycle: 1, entries: [] };
    this.historyAvailable = this.repository.save(clearedHistory);
    this.persistenceIssue = this.historyAvailable ? null : "clear";
    const language = this.game?.language ?? this.nextLanguage;
    if (this.historyAvailable) this.history = clearedHistory;

    if (hadActiveGame) {
      this.feedback = this.historyAvailable
        ? (language === "en" ? "History cleared." : "Histórico apagado.")
        : (language === "en" ? "Saved history could not be cleared." : "Não foi possível apagar o histórico salvo.");
      this.emit();
      return;
    }

    if (this.historyAvailable) {
      this.startRound();
    } else {
      this.feedback = language === "en" ? "Saved history could not be cleared." : "Não foi possível apagar o histórico salvo.";
      this.emit();
    }
  }

  private toCompletedGame(game: GameState): CompletedGame {
    return {
      schemaVersion: 1,
      gameId: crypto.randomUUID(),
      cycle: this.history.cycle,
      wordId: game.word.id,
      answerSnapshot: game.word.answer,
      language: game.language,
      definitionSnapshot: game.word.definition,
      cluesShown: game.word.clues.slice(0, game.revealedClueCount),
      guesses: game.guesses,
      outcome: game.status === "won" ? "won" : "lost",
      completedAt: game.completedAt ?? new Date().toISOString(),
    };
  }

  private emit(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
