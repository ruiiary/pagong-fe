import { apiClient } from "./client";
import { Project, FileItem, CreateProjectInput } from "@/types";

export const projectsApi = {
  // GET /api/projects
  list: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>("/api/projects");
    return data;
  },

  // GET /api/projects/{project_id}
  get: async (projectId: number): Promise<Project> => {
    const { data } = await apiClient.get<Project>(`/api/projects/${projectId}`);
    return data;
  },

  // POST /api/projects
  create: async (input: CreateProjectInput): Promise<Project> => {
    const { data } = await apiClient.post<Project>("/api/projects", input);
    return data;
  },

  // GET /api/projects/{project_id}/files?fileType=
  files: async (
    projectId: number,
    fileType?: string | null,
  ): Promise<FileItem[]> => {
    const { data } = await apiClient.get<FileItem[]>(
      `/api/projects/${projectId}/files`,
      { params: fileType ? { fileType } : undefined },
    );
    return data;
  },

  // POST /api/projects/{project_id}/files (multipart/form-data)
  uploadFile: async (
    projectId: number,
    fileType: string,
    file: File,
  ): Promise<FileItem> => {
    const formData = new FormData();
    formData.append("fileType", fileType);
    formData.append("file", file);
    const { data } = await apiClient.post<FileItem>(
      `/api/projects/${projectId}/files`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },
};
