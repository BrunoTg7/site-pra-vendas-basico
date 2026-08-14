import { STORAGE_KEYS } from "../utils/constants.js";

export interface UserCredentials {
  email: string;
  senha: string; // hashed
}

export interface Task {
  id: string;
  lista: string;
  selecao: boolean;
  data: string;
  timestamp: string; // ISO 8601
  tags: string[];
  completed: boolean;
}

export interface UserTasks {
  [date: string]: Task[];
}

export interface AllTasksStorage {
  [email: string]: UserTasks;
}

export class StorageService {
  static getUserCredentials(): UserCredentials | null {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);
    if (!stored) return null;
    try {
      return JSON.parse(atob(stored)) as UserCredentials;
    } catch {
      return null;
    }
  }

  static setUserCredentials(credentials: UserCredentials): void {
    localStorage.setItem(
      STORAGE_KEYS.USER_CREDENTIALS,
      btoa(JSON.stringify(credentials))
    );
  }

  static getLoginTime(): Date | null {
    const stored = localStorage.getItem(STORAGE_KEYS.LOGIN_TIME);
    if (!stored) return null;
    const date = new Date(stored);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  static setLoginTime(date: Date = new Date()): void {
    localStorage.setItem(STORAGE_KEYS.LOGIN_TIME, date.toISOString());
  }

  static clearLoginTime(): void {
    localStorage.removeItem(STORAGE_KEYS.LOGIN_TIME);
  }

  static getAllTasks(): AllTasksStorage {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_TASKS);
    if (!stored) return {};
    try {
      return JSON.parse(atob(stored)) as AllTasksStorage;
    } catch {
      return {};
    }
  }

  static setAllTasks(tasks: AllTasksStorage): void {
    localStorage.setItem(
      STORAGE_KEYS.USER_TASKS,
      btoa(JSON.stringify(tasks))
    );
  }

  static getUserTasks(email: string): UserTasks {
    const allTasks = this.getAllTasks();
    const userTasks = allTasks[email] || {};

    let normalized = false;
    Object.keys(userTasks).forEach((date) => {
      userTasks[date] = userTasks[date].map((task) => {
        if (!task.id || !task.tags || !task.timestamp || typeof task.completed !== "boolean") {
          normalized = true;
        }
        return {
          id: task.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          lista: task.lista,
          selecao: Boolean(task.selecao),
          data: task.data || date,
          timestamp: task.timestamp || new Date().toISOString(),
          tags: Array.isArray(task.tags) ? task.tags : [],
          completed: Boolean(task.completed),
        };
      });
    });

    if (normalized) {
      this.setUserTasks(email, userTasks);
    }

    return userTasks;
  }

  static setUserTasks(email: string, tasks: UserTasks): void {
    const allTasks = this.getAllTasks();
    allTasks[email] = tasks;
    this.setAllTasks(allTasks);
  }

  static getCookieConsent(): boolean {
    return localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT) === "accepted";
  }

  static setCookieConsent(): void {
    localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, "accepted");
  }
}