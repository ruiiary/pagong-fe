import { User } from "@/types";

const KEY = "auth_user";

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: User) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(KEY);
}

export function isLoggedIn(): boolean {
  return getStoredUser() !== null;
}
