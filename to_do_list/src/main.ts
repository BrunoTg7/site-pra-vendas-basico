import { UIController } from "./ui/UIController.js";
import { StorageService } from "./services/StorageService.js";
import { AuthService } from "./services/AuthService.js";

function cleanupOldStorage(): void {
  const oldKeys = [
    "5s51d2a30as5f",
    "gjs5s4c1a24ss4d",
    "loginTime",
    "loggedUser",
    "lgbd",
  ];
  oldKeys.forEach((key) => localStorage.removeItem(key));
}

document.addEventListener("DOMContentLoaded", () => {
  // Clean up old localStorage format
  cleanupOldStorage();

  // Initialize cookie consent
  if (!StorageService.getCookieConsent()) {
    const overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.classList.add("amostrar");
    }
  }

  // Check if we're on the login page (index.html) or tasks page (tarefas.html)
  const isTasksPage = document.querySelector(".tarefa") !== null;
  const isLoginPage = document.querySelector(".auth-form") !== null;

  if (isLoginPage) {
    // Initialize only auth controller for login page
    try {
      import("./ui/AuthController.js").then(({ AuthController }) => {
        new AuthController();
      });
    } catch (error) {
      console.error("Failed to initialize auth:", error);
    }
  } else if (isTasksPage) {
    // Initialize full UI controller for tasks page
    try {
      new UIController();
    } catch (error) {
      console.error("Failed to initialize app:", error);
    }
  }
});