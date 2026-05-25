import { apiClient } from "./client";
import { storeToken } from "@/lib/authStore";
import { User } from "@/types";

export const authApi = {
  // POST /api/auth/login → 서버는 token string만 반환
  login: async (
    email: string,
    password: string,
  ): Promise<{ token: string; user: User }> => {
    const { data: token } = await apiClient.post<string>("/api/auth/login", {
      email,
      password,
    });
    storeToken(token);
    const user = await authApi.me();
    return { token, user };
  },

  // GET /api/auth/me → 로그인한 유저 정보 반환
  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>("/api/auth/me");
    return data;
  },
};
