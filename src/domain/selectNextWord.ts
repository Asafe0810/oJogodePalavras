import { normalizeGuess } from "./normalizeGuess";
import type { CompletedGame, Language, WordEntry } from "./types";

export function selectNextWord(
  words: readonly WordEntry[],
  history: readonly CompletedGame[],
  language: Language,
  cycle: number,
  random: () => number = Math.random,
): WordEntry | null {
  const usedIds = new Set(
    history
      .filter((entry) => entry.cycle === cycle && entry.language === language)
      .map((entry) => entry.wordId),
  );
  const usedAnswers = new Set(
    history
      .filter((entry) => entry.cycle === cycle && entry.language === language)
      .map((entry) => normalizeGuess(entry.answerSnapshot, language)),
  );
  const available = words.filter((word) =>
    word.language === language
    && !usedIds.has(word.id)
    && !usedAnswers.has(normalizeGuess(word.answer, language)),
  );

  if (available.length === 0) return null;
  const index = Math.min(available.length - 1, Math.floor(random() * available.length));
  return available[Math.max(0, index)];
}
