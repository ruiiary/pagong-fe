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
};
