import type { GameController, AppSnapshot } from "../app/gameController";
import { MAX_GUESSES } from "../domain/constants";
import type { CompletedGame, Language, WordEntry } from "../domain/types";
import { getStrings } from "./locale";

function requireElement<T extends HTMLElement>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Elemento obrigatório ausente: ${selector}`);
  return element;
}

function makeElement<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
}

function languageName(language: Language): string {
  return language === "en" ? "English" : "Português";
}

function renderAttemptRail(root: HTMLElement, snapshot: AppSnapshot, language: Language): void {
  const list = requireElement<HTMLOListElement>(root, "#attempt-rail");
  const strings = getStrings(language);
  const usedCount = snapshot.game?.guesses.length ?? 0;
  list.replaceChildren();

  for (let index = 0; index < MAX_GUESSES; index += 1) {
    const used = index < usedCount;
    const current = snapshot.game?.status === "playing" && index === usedCount;
    const item = makeElement("li", [used ? "is-used" : "", current ? "is-current" : ""].filter(Boolean).join(" "));
    const state = used ? strings.used : current ? strings.current : strings.available;
    item.setAttribute("aria-label", `${strings.attempt} ${index + 1}, ${state}`);

    const number = makeElement("span", "attempt-dot");
    number.setAttribute("aria-hidden", "true");
    number.textContent = String(index + 1);
    const stateLabel = makeElement("span", "attempt-state");
    stateLabel.textContent = state;
    item.append(number, stateLabel);
    list.append(item);
  }
}

function renderClues(root: HTMLElement, word: WordEntry, visibleCount: number, language: Language): void {
  const list = requireElement<HTMLOListElement>(root, "#clue-list");
  const strings = getStrings(language);
  list.replaceChildren();
  list.lang = word.language;

  word.clues.forEach((clue, index) => {
    const revealed = index < visibleCount;
    const row = makeElement("li", `clue-row${revealed ? "" : " is-locked"}`);
    const number = makeElement("span", "clue-number");
    number.setAttribute("aria-hidden", "true");
    number.textContent = String(index + 1).padStart(2, "0");
    const text = makeElement("span");
    text.textContent = revealed ? clue : strings.lockedClue;
    row.append(number, text);
    list.append(row);
  });
}

function renderAnswer(root: HTMLElement, game: NonNullable<AppSnapshot["game"]>, language: Language): void {
  const container = requireElement<HTMLDivElement>(root, "#answer-tiles");
  const solved = game.status !== "playing";
  container.replaceChildren();
  [...game.word.answer].forEach((letter) => {
    const tile = makeElement("span", `answer-tile${solved ? " is-revealed" : ""}`);
    tile.setAttribute("aria-hidden", "true");
    tile.textContent = solved ? letter : "_";
    container.append(tile);
  });
  container.lang = game.language;
  container.setAttribute("aria-label", solved
    ? `${language === "en" ? "Answer" : "Resposta"}: ${game.word.answer}`
    : `${language === "en" ? "Hidden word with" : "Palavra oculta com"} ${[...game.word.answer].length} ${language === "en" ? "letters" : "letras"}`);
}

function renderGuesses(root: HTMLElement, game: NonNullable<AppSnapshot["game"]>, language: Language): void {
  const list = requireElement<HTMLOListElement>(root, "#guess-list");
  const empty = requireElement<HTMLParagraphElement>(root, "#guess-empty");
  list.replaceChildren();
  list.hidden = game.guesses.length === 0;
  empty.hidden = game.guesses.length > 0;

  game.guesses.forEach((guess) => {
    const row = makeElement("li");
    const value = makeElement("span", "guess-value");
    value.textContent = guess.value;
    const result = makeElement("span", `guess-result${guess.correct ? " is-correct" : ""}`);
    result.textContent = guess.correct
      ? (language === "en" ? "correct" : "correta")
      : (language === "en" ? "not found" : "não encontrada");
    row.append(value, result);
    list.append(row);
  });
}

function renderHistory(root: HTMLElement, entries: readonly CompletedGame[], language: Language): void {
  const list = requireElement<HTMLOListElement>(root, "#history-list");
  const total = requireElement<HTMLSpanElement>(root, "#history-total");
  const strings = getStrings(language);
  list.replaceChildren();
  total.textContent = `${entries.length} ${strings.historyCount}`;

  if (entries.length === 0) {
    const empty = makeElement("li", "history-empty");
    empty.textContent = strings.historyEmpty;
    list.append(empty);
    return;
  }

  entries.forEach((entry) => {
    const row = makeElement("li", "history-entry");
    row.lang = entry.language;
    const heading = makeElement("div", "history-entry-heading");
    const answer = makeElement("strong");
    answer.textContent = entry.answerSnapshot;
    const result = makeElement("span", `history-result ${entry.outcome}`);
    result.textContent = entry.outcome === "won" ? strings.win : strings.loss;
    heading.append(answer, result);

    const metadata = makeElement("p", "history-meta");
    const locale = entry.language === "en" ? "en" : "pt-BR";
    const date = new Date(entry.completedAt).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
    metadata.textContent = `${date} · ${entry.guesses.length}/${MAX_GUESSES} ${strings.attempts}`;

    const details = makeElement("details", "history-details");
    const summary = makeElement("summary");
    summary.textContent = strings.viewDetails;
    const definition = makeElement("p");
    definition.textContent = entry.definitionSnapshot;
    const guesses = makeElement("p");
    guesses.textContent = `${strings.guesses}: ${entry.guesses.map((guess) => guess.value).join(", ") || "—"}`;
    const clues = makeElement("p");
    clues.textContent = `${strings.cluesShown}: ${entry.cluesShown.join(" · ")}`;
    details.append(summary, definition, guesses, clues);
    row.append(heading, metadata, details);
    list.append(row);
  });
}

function updateTranslations(root: HTMLElement, snapshot: AppSnapshot): Language {
  const language = snapshot.game?.language ?? snapshot.nextLanguage;
  const strings = getStrings(language);
  document.documentElement.lang = language;
  document.title = strings.documentTitle;

  const translations: Record<string, string> = {
    "[data-eyebrow]": strings.eyebrow,
    "[data-page-title]": strings.pageTitle,
    "[data-page-intro]": strings.intro,
    "[data-brand]": strings.brand,
    "[data-brand-descriptor]": strings.brandDescriptor,
    "[data-next-language]": strings.nextLanguage,
    "[data-history-label]": strings.history,
    "[data-remaining-label]": strings.remaining,
    "[data-clue-label]": strings.clue,
    "[data-question]": strings.question,
    "[data-language-hint]": strings.languageHint,
    "[data-deduce]": strings.deduce,
    "[data-guess-label]": strings.guessLabel,
    "[data-submit]": strings.submit,
    "[data-guesses-label]": strings.guesses,
    "[data-empty-guesses]": strings.noGuesses,
    "[data-definition-label]": strings.definition,
    "[data-next-round]": strings.nextRoundButton,
    "[data-cycle-complete]": language === "en" ? "CYCLE COMPLETE" : "CICLO CONCLUÍDO",
    "[data-exhausted-title]": strings.exhaustedTitle,
    "[data-exhausted-body]": strings.exhaustedBody,
    "[data-restart-cycle]": strings.restartCycle,
    "[data-footer-note]": strings.savedLocally,
    "[data-footer-tagline]": language === "en" ? "NO ACCOUNT · NO ADS" : "SEM CONTA · SEM ANÚNCIOS",
    "[data-history-kicker]": language === "en" ? "COMPLETED ROUNDS" : "PARTIDAS CONCLUÍDAS",
    "[data-history-title]": strings.historyTitle,
    "[data-history-note]": strings.historyNote,
    "[data-clear-history]": strings.clearHistory,
    "[data-close-history]": strings.close,
  };

  Object.entries(translations).forEach(([selector, value]) => {
    const element = root.querySelector<HTMLElement>(selector);
    if (element) element.textContent = value;
  });
  requireElement<HTMLInputElement>(root, "#guess-input").placeholder = strings.guessPlaceholder;
  requireElement<HTMLButtonElement>(root, "#close-history").setAttribute("aria-label", strings.close);
  requireElement<HTMLElement>(root, ".language-control").setAttribute("aria-label", strings.languageControl);
  requireElement<HTMLElement>(root, "#attempt-rail").setAttribute("aria-label", strings.attemptProgress);
  requireElement<HTMLElement>(root, "#clue-list").setAttribute("aria-label", strings.clue);
  requireElement<HTMLElement>(root, "#guess-list").setAttribute("aria-label", strings.guesses);
  return language;
}

export function mountGameView(root: HTMLElement, controller: GameController): void {
  const input = requireElement<HTMLInputElement>(root, "#guess-input");
  const gamePanel = requireElement<HTMLDivElement>(root, "#active-game");
  const exhaustedPanel = requireElement<HTMLElement>(root, "#catalog-exhausted");
  const dialog = requireElement<HTMLDialogElement>(root, "#history-dialog");
  const status = requireElement<HTMLParagraphElement>(root, "#guess-status");
  const resultPanel = requireElement<HTMLElement>(root, "#round-summary");

  controller.subscribe((snapshot) => {
    const language = updateTranslations(root, snapshot);
    const strings = getStrings(language);
    const game = snapshot.game;
    gamePanel.hidden = !game;
    exhaustedPanel.hidden = Boolean(game);

    root.querySelectorAll<HTMLButtonElement>("[data-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === snapshot.nextLanguage));
    });
    root.querySelectorAll<HTMLElement>("[data-history-count]").forEach((element) => {
      element.textContent = String(snapshot.history.entries.length);
    });

    if (!game) {
      status.textContent = "";
      return;
    }

    const used = game.guesses.length;
    const visibleClues = game.revealedClueCount;
    requireElement<HTMLElement>(root, "[data-round-number]").textContent = String(snapshot.roundNumber).padStart(2, "0");
    requireElement<HTMLElement>(root, "[data-remaining]").textContent = String(MAX_GUESSES - used);
    requireElement<HTMLElement>(root, "#clue-current").textContent = String(visibleClues);
    requireElement<HTMLElement>(root, "#clue-total").textContent = String(game.word.clues.length);
    requireElement<HTMLElement>(root, "#game-language").textContent = languageName(game.language);
    input.lang = game.language;
    input.disabled = game.status !== "playing";
    requireElement<HTMLButtonElement>(root, "#submit-guess").disabled = game.status !== "playing";
    const persistenceMessage = snapshot.persistenceIssue === "clear"
      ? strings.historyClearFailure
      : snapshot.persistenceIssue
        ? strings.storageWarning
        : "";
    status.textContent = snapshot.persistenceIssue === "clear"
      ? strings.historyClearFailure
      : persistenceMessage
        ? `${snapshot.feedback} ${persistenceMessage}`.trim()
        : snapshot.feedback;
    status.classList.toggle("is-warning", !snapshot.historyAvailable);

    renderAttemptRail(root, snapshot, language);
    renderAnswer(root, game, language);
    renderClues(root, game.word, visibleClues, language);
    renderGuesses(root, game, language);

    resultPanel.hidden = game.status === "playing";
    if (game.status !== "playing") {
      requireElement<HTMLElement>(root, "#result-label").textContent = game.status === "won" ? strings.success : strings.failure;
      requireElement<HTMLElement>(root, "#revealed-answer").textContent = game.word.answer;
      requireElement<HTMLElement>(root, "#definition-copy").textContent = game.word.definition;
      requireElement<HTMLElement>(root, "#revealed-answer").lang = game.language;
      requireElement<HTMLElement>(root, "#definition-copy").lang = game.language;
    }
    requireElement<HTMLButtonElement>(root, "#next-round").disabled = game.status === "playing";
  });

  requireElement<HTMLFormElement>(root, "#guess-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const outcome = controller.submit(input.value);
    if (outcome !== "empty" && outcome !== "closed") input.value = "";
    if (outcome === "incorrect" || outcome === "empty") input.focus();
    if (outcome === "correct" || outcome === "lost") {
      requireElement<HTMLElement>(root, "#revealed-answer").focus();
    }
  });

  root.querySelectorAll<HTMLButtonElement>("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      const hadActiveGame = Boolean(controller.getSnapshot().game);
      controller.setNextLanguage(button.dataset.language as Language);
      if (!hadActiveGame && controller.getSnapshot().game) input.focus();
    });
  });
  requireElement<HTMLButtonElement>(root, "#next-round").addEventListener("click", () => {
    if (controller.startRound()) input.focus();
  });
  requireElement<HTMLButtonElement>(root, "#restart-cycle").addEventListener("click", () => {
    controller.beginNextCycle();
    input.focus();
  });
  requireElement<HTMLButtonElement>(root, "#open-history").addEventListener("click", () => {
    const snapshot = controller.getSnapshot();
    const language = snapshot.game?.language ?? snapshot.nextLanguage;
    renderHistory(root, snapshot.history.entries, language);
    const historyFeedback = requireElement<HTMLParagraphElement>(root, "#history-feedback");
    historyFeedback.textContent = "";
    historyFeedback.classList.remove("is-warning");
    dialog.showModal();
  });
  requireElement<HTMLButtonElement>(root, "#close-history").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  requireElement<HTMLButtonElement>(root, "#clear-history").addEventListener("click", () => {
    const snapshot = controller.getSnapshot();
    const language = snapshot.game?.language ?? snapshot.nextLanguage;
    if (window.confirm(getStrings(language).clearConfirmation)) {
      controller.clearHistory();
      const updatedSnapshot = controller.getSnapshot();
      renderHistory(root, updatedSnapshot.history.entries, language);
      const historyFeedback = requireElement<HTMLParagraphElement>(root, "#history-feedback");
      historyFeedback.textContent = updatedSnapshot.persistenceIssue === "clear"
        ? getStrings(language).historyClearFailure
        : getStrings(language).historyWasCleared;
      historyFeedback.classList.toggle("is-warning", updatedSnapshot.persistenceIssue === "clear");
    }
  });
}
