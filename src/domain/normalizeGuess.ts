import type { Language } from "./types";

export function normalizeGuess(value: string, language: Language): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase(language);
}

export function countLetters(value: string): number {
  return [...value.normalize("NFC")].filter((character) => /\p{L}/u.test(character)).length;
}
