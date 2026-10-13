import { describe, expect, it } from "vitest";
import { createHistoryRepository, HISTORY_KEY, type StorageLike } from "../../src/persistence/historyRepository";
import type { StoredHistory } from "../../src/domain/types";

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  failWrites = false;

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.failWrites) throw new Error("quota exceeded");
    this.values.set(key, value);
  }
}

const history: StoredHistory = {
  schemaVersion: 1,
  cycle: 2,
  entries: [{
    schemaVersion: 1,
    gameId: "game-1",
    cycle: 2,
    wordId: "garden",
    answerSnapshot: "GARDEN",
    language: "en",
    definitionSnapshot: "A cultivated outdoor space.",
    cluesShown: ["A clue."],
    guesses: [{ value: "garden", normalizedValue: "garden", correct: true, submittedAt: "2026-10-13T12:00:00.000Z" }],
    outcome: "won",
    completedAt: "2026-10-13T12:00:00.000Z",
  }],
};

describe("history repository", () => {
  it("round-trips the versioned local history", () => {
    const storage = new MemoryStorage();
    const repository = createHistoryRepository(storage);

    expect(repository.save(history)).toBe(true);
    expect(storage.getItem(HISTORY_KEY)).not.toBeNull();
    expect(repository.load()).toEqual(history);
  });

  it("recovers from malformed saved JSON", () => {
    const storage = new MemoryStorage();
    storage.values.set(HISTORY_KEY, "not-json");

    expect(createHistoryRepository(storage).load()).toEqual({ schemaVersion: 1, cycle: 1, entries: [] });
  });

  it("reports storage write failures without throwing", () => {
    const storage = new MemoryStorage();
    storage.failWrites = true;

    expect(createHistoryRepository(storage).save(history)).toBe(false);
  });
});
