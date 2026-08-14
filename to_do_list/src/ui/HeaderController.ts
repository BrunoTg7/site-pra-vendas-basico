import { AuthService } from "../services/AuthService.js";
import { TaskService } from "../services/TaskService.js";
import { ThemeService } from "../services/ThemeService.js";
import { StorageService } from "../services/StorageService.js";

export class HeaderController {
  private logoutBtn: HTMLButtonElement | null = null;

  constructor(
    private onExport?: () => void,
    private onImport?: () => void,
    private onLogout?: () => void
  ) {
    this.init();
  }

  private init(): void {
    ThemeService.init();
    this.createHeaderActions();
  }

  private createHeaderActions(): void {
    const headerEl = document.querySelector("header");
    if (!headerEl) return;

    const headerActions = document.createElement("div");
    headerActions.className = "header-actions";

    // Export button
    const exportBtn = ThemeService.createActionButton(
      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
      "Exportar tarefas (JSON)",
      "Exportar tarefas",
      () => this.handleExport()
    );
    headerActions.appendChild(exportBtn);

    // Import button
    const importBtn = ThemeService.createActionButton(
      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 10 12 15 7 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
      "Importar tarefas (JSON)",
      "Importar tarefas",
      () => this.handleImport()
    );
    headerActions.appendChild(importBtn);

    // Theme toggle
    const themeToggle = ThemeService.createToggleButton();
    headerActions.appendChild(themeToggle);

    // Logout button (with logo image)
    this.logoutBtn = document.createElement("button");
    this.logoutBtn.id = "sair";
    this.logoutBtn.type = "button";
    this.logoutBtn.innerHTML = `<img src="icon_for_to-do_list-removebg-preview.png" alt="" />`;
    this.logoutBtn.addEventListener("click", () => {
      if (this.onLogout) {
        this.onLogout();
      } else {
        this.defaultLogout();
      }
    });
    headerActions.appendChild(this.logoutBtn);

    headerEl.appendChild(headerActions);
  }

  private handleExport(): void {
    const email = AuthService.getCurrentUserEmail();
    if (!email) {
      alert("Usuário não encontrado");
      return;
    }
    TaskService.downloadExport(email);
  }

  private handleImport(): void {
    const email = AuthService.getCurrentUserEmail();
    if (!email) {
      alert("Usuário não encontrado");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";
    input.addEventListener("change", async () => {
      const result = await TaskService.triggerImportFile(input, email);
      if (result.success) {
        alert(`${result.importedCount} tarefas importadas com sucesso!`);
        window.location.reload();
      } else {
        alert(result.error || "Erro ao importar");
      }
      input.remove();
    });
    document.body.appendChild(input);
    input.click();
  }

  private defaultLogout(): void {
    AuthService.logout();
    window.location.href = "index.html";
  }
}