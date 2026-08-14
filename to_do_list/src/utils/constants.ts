export const STORAGE_KEYS = {
  USER_CREDENTIALS: "user_credentials_v1",
  USER_TASKS: "user_tasks_v1",
  LOGIN_TIME: "login_time",
  COOKIE_CONSENT: "cookie_consent",
} as const;

export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes