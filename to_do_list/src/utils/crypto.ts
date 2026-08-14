export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    data,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(hash);
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);
  return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const combined = new Uint8Array(
      atob(storedHash)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    const salt = combined.slice(0, 16);
    const storedHashBytes = combined.slice(16);
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      data,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    const hash = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );
    const hashArray = new Uint8Array(hash);
    return (
      hashArray.length === storedHashBytes.length &&
      hashArray.every((val, i) => val === storedHashBytes[i])
    );
  } catch {
    return false;
  }
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Mínimo 8 caracteres");
  if (!/[A-Z]/.test(password)) errors.push("Pelo menos 1 maiúscula");
  if (!/[a-z]/.test(password)) errors.push("Pelo menos 1 minúscula");
  if (!/[0-9]/.test(password)) errors.push("Pelo menos 1 número");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("Pelo menos 1 símbolo");
  return { valid: errors.length === 0, errors };
}