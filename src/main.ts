import Phaser from "phaser";
import { gameConfig } from "./core/gameConfig";

function showStartupError(message: string): void {
  const root = document.getElementById("game-root");
  if (!root) {
    return;
  }

  const errorBox = document.createElement("pre");
  errorBox.style.color = "#ffd8d8";
  errorBox.style.background = "#2b1111";
  errorBox.style.margin = "16px";
  errorBox.style.padding = "12px";
  errorBox.style.border = "1px solid #b54f4f";
  errorBox.style.whiteSpace = "pre-wrap";
  errorBox.textContent = `Startup error:\n${message}`;
  root.replaceChildren(errorBox);
}

window.addEventListener("error", (event) => {
  showStartupError(event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  showStartupError(String(event.reason));
});

try {
  new Phaser.Game(gameConfig);
} catch (error) {
  showStartupError(String(error));
}
