import { StorageService } from "./StorageService.js";
import { hashPassword, verifyPassword, validatePassword } from "../utils/crypto.js";
import { SESSION_TIMEOUT_MS } from "../utils/constants.js";

export interface AuthResult {
  success: boolean;
  error?: string;
}

export class AuthService {
  static async register(
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResult> {
    const validation = validatePassword(password);
    if (!validation.valid) {
      return { success: false, error: "Senha fraca:\n- " + validation.errors.join("\n- ") };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "As senhas não coincidem" };
    }

    const existing = StorageService.getUserCredentials();
    if (existing && existing.email === email) {
      return { success: false, error: "Email já cadastrado" };
    }

    const hashedPassword = await hashPassword(password);
    StorageService.setUserCredentials({ email, senha: hashedPassword });
    StorageService.setLoginTime();

    return { success: true };
  }

  static async login(email: string, password: string): Promise<AuthResult> {
    const stored = StorageService.getUserCredentials();
    if (!stored) {
      return { success: false, error: "Nenhum usuário cadastrado" };
    }

    if (stored.email !== email) {
      return { success: false, error: "Credenciais inválidas" };
    }

    const passwordMatch = await verifyPassword(password, stored.senha);
    if (!passwordMatch) {
      return { success: false, error: "Credenciais inválidas" };
    }

    StorageService.setLoginTime();
    return { success: true };
  }

  static logout(): void {
    StorageService.clearLoginTime();
  }

  static isSessionValid(): boolean {
    const loginTime = StorageService.getLoginTime();
    if (!loginTime) return false;

    // Also verify credentials exist and are valid format
    const creds = StorageService.getUserCredentials();
    if (!creds || !creds.email || !creds.senha) return false;

    const now = new Date();
    const diff = now.getTime() - loginTime.getTime();
    return diff < SESSION_TIMEOUT_MS;
  }

  static getRemainingSessionTime(): number {
    const loginTime = StorageService.getLoginTime();
    if (!loginTime) return 0;

    const now = new Date();
    const diff = now.getTime() - loginTime.getTime();
    return Math.max(0, SESSION_TIMEOUT_MS - diff);
  }

  static getCurrentUserEmail(): string | null {
    const creds = StorageService.getUserCredentials();
    return creds?.email || null;
  }
}