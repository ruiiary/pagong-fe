import { apiClient } from "./client";
import { User } from "@/types";

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: User }>("/auth/login", {
      email,
      password,
    }),

  me: () => apiClient.get<User>("/auth/me"),
};
