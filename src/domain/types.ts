export type Language = "pt-BR" | "en";
export type GameStatus = "playing" | "won" | "lost";
export type GuessOutcome = "empty" | "correct" | "incorrect" | "lost" | "closed";

export interface WordEntry {
  id: string;
  answer: string;
  language: Language;
  definition: string;
  clues: string[];
  sourceRef: string;
}

export interface GuessRecord {
  value: string;
  normalizedValue: string;
  correct: boolean;
  submittedAt: string;
}

export interface GameState {
  word: WordEntry;
  language: Language;
  status: GameStatus;
  guesses: GuessRecord[];
  revealedClueCount: number;
  startedAt: string;
  completedAt?: string;
}

export interface CompletedGame {
  schemaVersion: 1;
  gameId: string;
  cycle: number;
  wordId: string;
  answerSnapshot: string;
  language: Language;
  definitionSnapshot: string;
  cluesShown: string[];
  guesses: GuessRecord[];
  outcome: "won" | "lost";
  completedAt: string;
}

export interface StoredHistory {
  schemaVersion: 1;
  cycle: number;
  entries: CompletedGame[];
}
