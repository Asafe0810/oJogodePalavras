import "./styles.css";
import { GameController } from "./app/gameController";
import { mountGameView } from "./ui/gameView";

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("Elemento raiz #app não encontrado.");

const controller = new GameController();
mountGameView(root, controller);
if (controller.startRound()) root.querySelector<HTMLInputElement>("#guess-input")?.focus();
