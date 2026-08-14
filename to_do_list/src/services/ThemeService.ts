export class ThemeService {
  private static readonly STORAGE_KEY = "theme_preference";
  private static readonly DARK_CLASS = "theme-dark";
  private static readonly LIGHT_CLASS = "theme-light";

  private static readonly SUN_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

  private static readonly MOON_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  static init(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    this.applyTheme(isDark);
  }

  static toggle(): boolean {
    const isDark = !document.documentElement.classList.contains(this.DARK_CLASS);
    this.applyTheme(isDark);
    localStorage.setItem(this.STORAGE_KEY, isDark ? "dark" : "light");
    return isDark;
  }

  static isDark(): boolean {
    return document.documentElement.classList.contains(this.DARK_CLASS);
  }

  private static applyTheme(isDark: boolean): void {
    document.documentElement.classList.toggle(this.DARK_CLASS, isDark);
    document.documentElement.classList.toggle(this.LIGHT_CLASS, !isDark);
  }

  static createToggleButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle-btn";
    const isDark = this.isDark();
    button.innerHTML = isDark ? this.SUN_SVG : this.MOON_SVG;
    button.title = isDark ? "Tema claro" : "Tema escuro";
    button.setAttribute("aria-label", isDark ? "Alternar para tema claro" : "Alternar para tema escuro");
    button.addEventListener("click", () => {
      const isDark = this.toggle();
      button.innerHTML = isDark ? this.SUN_SVG : this.MOON_SVG;
      button.title = isDark ? "Tema claro" : "Tema escuro";
      button.setAttribute("aria-label", isDark ? "Alternar para tema claro" : "Alternar para tema escuro");
    });
    return button;
  }

  static createActionButton(icon: string, title: string, ariaLabel: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle-btn";
    button.innerHTML = icon;
    button.title = title;
    button.setAttribute("aria-label", ariaLabel);
    button.addEventListener("click", onClick);
    return button;
  }
}