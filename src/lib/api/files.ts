import { apiClient } from "./client";
import { FileItem, ShareLink } from "@/types";

export const filesApi = {
  get: (fileId: number) => apiClient.get<FileItem>(`/files/${fileId}`),

  upload: (projectId: number, formData: FormData) =>
    fetch(`/projects/${projectId}/files`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token") ?? ""}`,
      },
    }).then((r) => r.json() as Promise<FileItem>),

  download: (fileId: number) =>
    apiClient.get<{ downloadUrl: string }>(`/files/${fileId}/download`),

  createShareLink: (fileId: number, body: { expiresInDays: number }) =>
    apiClient.post<ShareLink>(`/files/${fileId}/share-links`, body),

  getShareLink: (token: string) =>
    apiClient.get<{
      file: { filename: string; fileSize: number; mimeType: string };
      expiresAt: string;
    }>(`/share-links/${token}`),

  downloadShared: (token: string) =>
    apiClient.get<{ downloadUrl: string }>(`/share-links/${token}/download`),
};
