import { apiClient } from "./client";
import { User, UserRole } from "@/types";

interface ApiUser {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}

export const usersApi = {
  // GET /api/users?role=
  list: async (role?: string): Promise<User[]> => {
    const { data } = await apiClient.get<{ users: ApiUser[] }>("/api/users", {
      params: role ? { role } : undefined,
    });
    return data.users.map((u) => ({
      id: u.userId,
      name: u.name,
      email: u.email,
      role: u.role,
    }));
  },
};
