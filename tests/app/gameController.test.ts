import { describe, expect, it } from "vitest";
import { GameController } from "../../src/app/gameController";
import type { CompletedGame, StoredHistory, WordEntry } from "../../src/domain/types";
import type { HistoryRepository } from "../../src/persistence/historyRepository";

const portugueseWord: WordEntry = {
  id: "jardim",
  answer: "JARDIM",
  language: "pt-BR",
  definition: "Um espaço cultivado.",
  clues: ["Pista um.", "Pista dois."],
  sourceRef: "Conteúdo editorial interno",
};

const englishWord: WordEntry = {
  id: "garden",
  answer: "GARDEN",
  language: "en",
  definition: "A cultivated outdoor space.",
  clues: ["Clue one."],
  sourceRef: "Original editorial content",
};

class MemoryRepository implements HistoryRepository {
  value: StoredHistory = { schemaVersion: 1, cycle: 1, entries: [] };
  failWrites = false;

  load(): StoredHistory {
    return this.value;
  }

  save(history: StoredHistory): boolean {
    if (this.failWrites) return false;
    this.value = history;
    return true;
  }
}

function makeCompleted(word: WordEntry): CompletedGame {
  return {
    schemaVersion: 1,
    gameId: `game-${word.id}`,
    cycle: 1,
    wordId: word.id,
    answerSnapshot: word.answer,
    language: word.language,
    definitionSnapshot: word.definition,
    cluesShown: word.clues.slice(0, 1),
    guesses: [{ value: word.answer, normalizedValue: word.answer.toLowerCase(), correct: true, submittedAt: "2026-10-13T12:00:00.000Z" }],
    outcome: "won",
    completedAt: "2026-10-13T12:00:00.000Z",
  };
}

describe("game controller", () => {
  it("starts the selected language when the current catalog is exhausted", () => {
    const repository = new MemoryRepository();
    repository.value.entries = [makeCompleted(portugueseWord)];
    const controller = new GameController({ words: [portugueseWord, englishWord], repository, random: () => 0 });

    expect(controller.startRound()).toBe(false);
    controller.setNextLanguage("en");

    expect(controller.getSnapshot().game?.language).toBe("en");
  });

  it("clears history without replacing an in-progress round", () => {
    const controller = new GameController({ words: [portugueseWord], repository: new MemoryRepository(), random: () => 0 });
    controller.startRound();
    controller.submit("florida");

    controller.clearHistory();
    const snapshot = controller.getSnapshot();

    expect(snapshot.game?.word.id).toBe("jardim");
    expect(snapshot.game?.guesses).toHaveLength(1);
    expect(snapshot.history.entries).toHaveLength(0);
    expect(snapshot.feedback).toBe("Histórico apagado.");
  });

  it("exposes local storage write failures in the snapshot", () => {
    const repository = new MemoryRepository();
    repository.failWrites = true;
    const controller = new GameController({ words: [portugueseWord], repository, random: () => 0 });
    controller.startRound();
    controller.submit("jardim");

    expect(controller.getSnapshot().historyAvailable).toBe(false);
  });

  it("reports failed history clearing without discarding the active guess", () => {
    const repository = new MemoryRepository();
    repository.value.entries = [makeCompleted(englishWord)];
    const controller = new GameController({ words: [portugueseWord], repository, random: () => 0 });
    controller.startRound();
    controller.submit("florida");
    repository.failWrites = true;

    controller.clearHistory();
    const snapshot = controller.getSnapshot();

    expect(snapshot.persistenceIssue).toBe("clear");
    expect(snapshot.feedback).toContain("Não foi possível apagar o histórico");
    expect(snapshot.game?.guesses).toHaveLength(1);
    expect(snapshot.history.entries).toHaveLength(1);
    expect(repository.load().entries).toHaveLength(1);
  });
});
