import { AuthService } from "../services/AuthService.js";
import { StorageService } from "../services/StorageService.js";
import { ThemeService } from "../services/ThemeService.js";

export class AuthController {
  private loginForm: HTMLDivElement | null = null;
  private registerForm: HTMLDivElement | null = null;

  constructor() {
    ThemeService.init();
    this.initDOMReferences();
    this.bindEvents();
    this.checkSession();
    this.initTabIndicator();
  }

  private initTabIndicator(): void {
    const activeTab = document.querySelector('.auth-tab.active') as HTMLElement;
    const indicator = document.querySelector('.auth-tab-indicator') as HTMLElement;
    if (activeTab && indicator) {
      indicator.style.transform = `translateX(${activeTab.offsetLeft - 6}px)`;
      indicator.style.width = `${activeTab.offsetWidth}px`;
    }
  }

  private initDOMReferences(): void {
    this.loginForm = document.querySelector("#login-form") as HTMLDivElement;
    this.registerForm = document.querySelector("#cadastro-form") as HTMLDivElement;
  }

  private bindEvents(): void {
    // Tab switching
    const authTabs = document.querySelectorAll<HTMLButtonElement>(".auth-tab");
    authTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabName = tab.dataset.tab as "login" | "cadastro";
        this.switchAuthTab(tabName);
      });
    });

    // Login form
    const loginBtn = document.getElementById("logar");
    if (loginBtn) {
      loginBtn.addEventListener("click", this.handleLogin.bind(this));
    }

    // Register form
    const registerBtn = document.getElementById("cadastro");
    if (registerBtn) {
      registerBtn.addEventListener("click", this.handleRegister.bind(this));
    }

    // Enter key support for forms
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const activeElement = document.activeElement;
        if (activeElement?.matches('#senha, #senha1, #confirmarSenha, #email, #email1')) {
          e.preventDefault();
          if (activeElement.id === 'senha' || activeElement.id === 'email') {
            this.handleLogin();
          } else if (activeElement.id === 'senha1' || activeElement.id === 'confirmarSenha' || activeElement.id === 'email1') {
            this.handleRegister();
          }
        }
      }
    });

    // Cookie consent
    const cookieAcceptBtn = document.querySelector(".cookies-btn2") as HTMLButtonElement;
    if (cookieAcceptBtn) {
      cookieAcceptBtn.addEventListener("click", this.handleCookieAccept.bind(this));
    }
  }

  private checkSession(): void {
    if (AuthService.isSessionValid()) {
      window.location.href = "tarefas.html";
    }
  }

  private async handleLogin(): Promise<void> {
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("senha") as HTMLInputElement;

    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";

    if (!email || !password) {
      alert("Preencha todos os campos");
      return;
    }

    const result = await AuthService.login(email, password);
    if (result.success) {
      alert("Login realizado com sucesso!");
      window.location.href = "tarefas.html";
    } else {
      alert(result.error || "Credenciais inválidas");
    }
  }

  private async handleRegister(): Promise<void> {
    const emailInput = document.getElementById("email1") as HTMLInputElement;
    const passwordInput = document.getElementById("senha1") as HTMLInputElement;
    const confirmPasswordInput = document.getElementById("confirmarSenha") as HTMLInputElement;

    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";
    const confirmPassword = confirmPasswordInput?.value || "";

    if (!email || !password || !confirmPassword) {
      alert("Preencha todos os campos");
      return;
    }

    const result = await AuthService.register(email, password, confirmPassword);
    if (result.success) {
      alert("Cadastro realizado com sucesso!");
      window.location.href = "tarefas.html";
    } else {
      alert(result.error || "Erro ao cadastrar");
    }
  }

  private switchAuthTab(tab: "login" | "cadastro"): void {
    const loginForm = document.querySelector("#login-form");
    const cadastroForm = document.querySelector("#cadastro-form");
    const loginTab = document.querySelector('.auth-tab[data-tab="login"]') as HTMLElement;
    const cadastroTab = document.querySelector('.auth-tab[data-tab="cadastro"]') as HTMLElement;
    const indicator = document.querySelector('.auth-tab-indicator') as HTMLElement;

    if (tab === "login") {
      loginForm?.classList.add("active");
      cadastroForm?.classList.remove("active");
      loginTab?.classList.add("active");
      cadastroTab?.classList.remove("active");
      if (indicator && loginTab) {
        indicator.style.transform = `translateX(${loginTab.offsetLeft - 6}px)`;
        indicator.style.width = `${loginTab.offsetWidth}px`;
      }
    } else {
      cadastroForm?.classList.add("active");
      loginForm?.classList.remove("active");
      cadastroTab?.classList.add("active");
      loginTab?.classList.remove("active");
      if (indicator && cadastroTab) {
        indicator.style.transform = `translateX(${cadastroTab.offsetLeft - 6}px)`;
        indicator.style.width = `${cadastroTab.offsetWidth}px`;
      }
    }
  }

  private handleCookieAccept(): void {
    StorageService.setCookieConsent();
    const overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.classList.remove("amostrar");
    }
  }
}