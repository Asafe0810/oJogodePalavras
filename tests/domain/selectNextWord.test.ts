import { describe, expect, it } from "vitest";
import { selectNextWord } from "../../src/domain/selectNextWord";
import type { CompletedGame, WordEntry } from "../../src/domain/types";

const words: WordEntry[] = [
  { id: "jardim", answer: "JARDIM", language: "pt-BR", definition: "D", clues: ["C"], sourceRef: "editorial" },
  { id: "oceano", answer: "OCEANO", language: "pt-BR", definition: "D", clues: ["C"], sourceRef: "editorial" },
  { id: "garden", answer: "GARDEN", language: "en", definition: "D", clues: ["C"], sourceRef: "editorial" },
];

function completed(word: WordEntry, cycle = 1): CompletedGame {
  return {
    schemaVersion: 1,
    gameId: `game-${word.id}`,
    cycle,
    wordId: word.id,
    answerSnapshot: word.answer,
    language: word.language,
    definitionSnapshot: word.definition,
    cluesShown: word.clues,
    guesses: [],
    outcome: "won",
    completedAt: "2026-10-13T12:00:00.000Z",
  };
}

describe("selectNextWord", () => {
  it("excludes words already played in the current language and cycle", () => {
    const result = selectNextWord(words, [completed(words[0])], "pt-BR", 1, () => 0);

    expect(result?.id).toBe("oceano");
  });

  it("does not treat other languages or earlier cycles as used", () => {
    const result = selectNextWord(words, [completed(words[2]), completed(words[1], 2)], "pt-BR", 1, () => 0);

    expect(result?.id).toBe("jardim");
  });

  it("returns null when every word in the language has been played", () => {
    const result = selectNextWord(words, [completed(words[0]), completed(words[1])], "pt-BR", 1);

    expect(result).toBeNull();
  });
});
