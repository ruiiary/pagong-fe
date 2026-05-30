import { apiClient } from "./client";
import { FileItem, ShareLinkDetail } from "@/types";

export const filesApi = {
  // GET /api/files/{file_id}
  get: async (fileId: number): Promise<FileItem> => {
    const { data } = await apiClient.get<FileItem>(`/api/files/${fileId}`);
    return data;
  },

  // GET /api/files/{file_id}/download
  download: async (fileId: number): Promise<{ downloadUrl: string }> => {
    const response = await apiClient.get(`/api/files/${fileId}/download`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], {
      type: String(
        response.headers["content-type"] ?? "application/octet-stream",
      ),
    });
    const disposition = response.headers["content-disposition"] ?? "";
    const filenameMatch = disposition.match(/filename="?([^";\n]+)"?/);
    const filename = filenameMatch?.[1] ?? `file-${fileId}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    return { downloadUrl: url };
  },

  // GET /api/share-links
  listShareLinks: async (): Promise<ShareLinkDetail[]> => {
    const { data } = await apiClient.get<{
      shareLinks: {
        shareLinkId: number;
        fileId: number;
        projectId: number;
        token: string;
        url: string;
        originalFilename: string;
        clientName?: string;
        createdBy: number;
        creatorName: string;
        expiresAt: string;
        status: string;
        createdAt: string;
      }[];
    }>("/api/share-links");
    return data.shareLinks.map((l) => ({
      id: l.shareLinkId,
      fileId: l.fileId,
      projectId: l.projectId,
      token: l.token,
      url: l.url,
      filename: l.originalFilename,
      clientName: l.clientName,
      createdById: l.createdBy,
      createdByName: l.creatorName,
      expiresAt: l.expiresAt,
      isActive: l.status === "ACTIVE",
      createdAt: l.createdAt,
      projectName: "",
    }));
  },

  // POST /api/files/{file_id}/share-links
  createShareLink: async (
    fileId: number,
    expiresInDays: number,
  ): Promise<{
    token: string;
    url: string;
    expiresAt: string;
    isActive: boolean;
  }> => {
    const { data } = await apiClient.post(`/api/files/${fileId}/share-links`, {
      expiresInDays,
    });
    return {
      token: data.token,
      url: data.url,
      expiresAt: data.expiresAt,
      isActive: data.status === "ACTIVE",
    };
  },
};
