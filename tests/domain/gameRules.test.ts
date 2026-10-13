import { describe, expect, it } from "vitest";
import { createGame, submitGuess } from "../../src/domain/gameRules";
import type { WordEntry } from "../../src/domain/types";

const portugueseWord: WordEntry = {
  id: "pessego",
  answer: "PÊSSEGO",
  language: "pt-BR",
  definition: "Fruta de caroço.",
  clues: ["Pista inicial.", "Pista seguinte.", "Última pista."],
  sourceRef: "Conteúdo editorial interno",
};

const englishWord: WordEntry = {
  id: "garden",
  answer: "GARDEN",
  language: "en",
  definition: "A cultivated outdoor space.",
  clues: ["A first clue."],
  sourceRef: "Original editorial content",
};

describe("game rules", () => {
  it("accepts guesses without Portuguese diacritics and ignores case", () => {
    const result = submitGuess(createGame(portugueseWord), "  pessego  ", "2026-10-13T12:00:00.000Z");

    expect(result.outcome).toBe("correct");
    expect(result.state.status).toBe("won");
    expect(result.state.guesses[0].normalizedValue).toBe("pessego");
  });

  it("normalizes English casing", () => {
    const result = submitGuess(createGame(englishWord), "garden");

    expect(result.outcome).toBe("correct");
  });

  it("does not consume an attempt for an empty guess", () => {
    const game = createGame(portugueseWord);
    const result = submitGuess(game, "   ");

    expect(result.outcome).toBe("empty");
    expect(result.state).toBe(game);
    expect(result.state.guesses).toHaveLength(0);
  });

  it("reveals a clue after an incorrect guess and ends on the sixth miss", () => {
    let state = createGame(portugueseWord);

    for (let attempt = 1; attempt <= 6; attempt += 1) {
      const result = submitGuess(state, `palpite${attempt}`, `2026-10-13T12:00:0${attempt}.000Z`);
      state = result.state;
      expect(result.outcome).toBe(attempt === 6 ? "lost" : "incorrect");
    }

    expect(state.status).toBe("lost");
    expect(state.guesses).toHaveLength(6);
    expect(state.revealedClueCount).toBe(portugueseWord.clues.length);
    expect(submitGuess(state, "sétimo palpite").outcome).toBe("closed");
  });
});
