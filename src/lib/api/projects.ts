import { apiClient } from "./client";
import { Project, FileItem, CreateProjectInput } from "@/types";

export const projectsApi = {
  create: (input: CreateProjectInput) =>
    apiClient.post<Project>("/projects", input),

  list: () => apiClient.get<Project[]>("/projects"),

  get: (projectId: number) => apiClient.get<Project>(`/projects/${projectId}`),

  files: (projectId: number) =>
    apiClient.get<FileItem[]>(`/projects/${projectId}/files`),
};
