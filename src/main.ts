import Phaser from "phaser";
import { gameConfig } from "./core/gameConfig";

declare global {
  interface Window {
    __cwStartupHooksAttached?: boolean;
  }
}

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

if (!window.__cwStartupHooksAttached) {
  window.addEventListener("error", (event) => {
    const details = event.error?.stack ? `${event.message}\n\n${event.error.stack}` : event.message;
    showStartupError(details);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as { message?: string; stack?: string } | undefined;
    if (reason?.stack) {
      showStartupError(`${reason.message ?? "Unhandled rejection"}\n\n${reason.stack}`);
      return;
    }
    showStartupError(String(event.reason));
  });

  window.__cwStartupHooksAttached = true;
}

try {
  new Phaser.Game(gameConfig);
} catch (error) {
  showStartupError(String(error));
}
