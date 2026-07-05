const TOKEN_KEY = "novaPulse.authToken";
const USER_KEY = "novaPulse.authUser";

export interface AuthenticatedUser {
  id: string;
  username: string;
  forcePasswordChange: boolean;
}

export function storeSession(token: string, user: AuthenticatedUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthenticatedUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthenticatedUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getStoredToken() !== null;
}
