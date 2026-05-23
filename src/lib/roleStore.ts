import { UserRole } from "@/types";

const KEY = "dev_role";

export function getRole(): UserRole {
  if (typeof window === "undefined") return "EMPLOYEE";
  return (localStorage.getItem(KEY) as UserRole) ?? "EMPLOYEE";
}

export function setRole(role: UserRole) {
  localStorage.setItem(KEY, role);
}
