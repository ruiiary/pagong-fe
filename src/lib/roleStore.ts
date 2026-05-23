import { UserRole } from "@/types";
import { getStoredUser } from "./authStore";

export function getRole(): UserRole {
  if (typeof window === "undefined") return "EMPLOYEE";
  return getStoredUser()?.role ?? "EMPLOYEE";
}

export function setRole(role: UserRole) {
  // Legacy — role is now derived from the stored user. This is kept for compatibility.
  const user = getStoredUser();
  if (user) {
    const { storeUser } = require("./authStore");
    storeUser({ ...user, role });
  }
}
