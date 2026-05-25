import { apiClient } from "./client";
import { FileItem } from "@/types";

export const filesApi = {
  // GET /api/files/{file_id}
  get: async (fileId: number): Promise<FileItem> => {
    const { data } = await apiClient.get<FileItem>(`/api/files/${fileId}`);
    return data;
  },

  // GET /api/files/{file_id}/download
  download: async (fileId: number): Promise<{ downloadUrl: string }> => {
    const { data } = await apiClient.get<{ downloadUrl: string }>(
      `/api/files/${fileId}/download`,
    );
    return data;
  },
};
