import { MAX_GUESSES } from "./constants";
import { normalizeGuess } from "./normalizeGuess";
import type { GameState, GuessOutcome, Language, WordEntry } from "./types";

export function createGame(word: WordEntry, startedAt = new Date().toISOString()): GameState {
  return {
    word,
    language: word.language,
    status: "playing",
    guesses: [],
    revealedClueCount: 1,
    startedAt,
  };
}

export interface GuessResult {
  state: GameState;
  outcome: GuessOutcome;
}

export function submitGuess(
  current: GameState,
  value: string,
  submittedAt = new Date().toISOString(),
): GuessResult {
  if (current.status !== "playing") return { state: current, outcome: "closed" };

  const trimmed = value.trim();
  if (!trimmed) return { state: current, outcome: "empty" };

  const normalizedValue = normalizeGuess(trimmed, current.language);
  const correct = normalizedValue === normalizeGuess(current.word.answer, current.language);
  const guesses = [...current.guesses, { value: trimmed, normalizedValue, correct, submittedAt }];
  const lost = !correct && guesses.length >= MAX_GUESSES;
  const status = correct ? "won" : lost ? "lost" : "playing";

  return {
    outcome: correct ? "correct" : lost ? "lost" : "incorrect",
    state: {
      ...current,
      guesses,
      status,
      revealedClueCount: correct
        ? current.revealedClueCount
        : Math.min(current.word.clues.length, current.revealedClueCount + 1),
      ...(status === "playing" ? {} : { completedAt: submittedAt }),
    },
  };
}

export function getFeedback(outcome: GuessOutcome, remaining: number, language: Language): string {
  if (language === "en") {
    if (outcome === "empty") return "Type a word before submitting.";
    if (outcome === "correct") return "You got it. The definition is below.";
    if (outcome === "lost") return "All six guesses are used. The answer and its definition are below.";
    if (outcome === "incorrect") return `Not this time. ${remaining} ${remaining === 1 ? "guess" : "guesses"} left. A new clue is available.`;
    return "This round is over. Start a new one to keep playing.";
  }
  if (outcome === "empty") return "Digite uma palavra antes de enviar.";
  if (outcome === "correct") return "Você acertou. A definição está logo abaixo.";
  if (outcome === "lost") return "As seis tentativas acabaram. Veja a resposta e sua definição.";
  if (outcome === "incorrect") {
    return `Palpite não encontrado. ${remaining} ${remaining === 1 ? "tentativa restante" : "tentativas restantes"}. Uma nova pista foi revelada.`;
  }
  return "Esta partida já terminou. Comece uma nova para continuar.";
}

