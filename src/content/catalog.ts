import englishWords from "./words.en.json";
import portugueseWords from "./words.pt-BR.json";
import { countLetters, normalizeGuess } from "../domain/normalizeGuess";
import type { Language, WordEntry } from "../domain/types";

export const WORDS: readonly WordEntry[] = [
  ...portugueseWords.map((word) => ({ ...word, language: "pt-BR" as const })),
  ...englishWords.map((word) => ({ ...word, language: "en" as const })),
];

export function validateCatalog(words: readonly WordEntry[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const answers = new Set<string>();

  words.forEach((word, index) => {
    const location = `Entrada ${index + 1} (${word.id || "sem id"})`;
    if (!word.id || ids.has(word.id)) errors.push(`${location}: id ausente ou duplicado.`);
    ids.add(word.id);
    if (!["pt-BR", "en"].includes(word.language)) errors.push(`${location}: idioma inválido.`);
    if (countLetters(word.answer) < 6) errors.push(`${location}: a resposta deve ter no mínimo seis letras.`);
    if (!word.definition.trim()) errors.push(`${location}: definição ausente.`);
    if (word.clues.length === 0 || word.clues.some((clue) => !clue.trim())) errors.push(`${location}: pistas ausentes ou vazias.`);
    if (!word.sourceRef.trim()) errors.push(`${location}: referência editorial ausente.`);

    const answerKey = `${word.language}:${normalizeGuess(word.answer, word.language as Language)}`;
    if (answers.has(answerKey)) errors.push(`${location}: resposta duplicada após normalização.`);
    answers.add(answerKey);
  });

  return errors;
}

const catalogErrors = validateCatalog(WORDS);
if (catalogErrors.length > 0) {
  throw new Error(`Catálogo de palavras inválido:\n${catalogErrors.join("\n")}`);
}
