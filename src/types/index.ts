// ─── User ───────────────────────────────────────────────────────────────────

export type UserRole = "EMPLOYEE" | "MANAGER_EXECUTIVE";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  canCreateShareLink?: boolean;
}

// ─── Project ─────────────────────────────────────────────────────────────────

export type ProjectStatus = "ACTIVE" | "CLOSED";

export interface Project {
  id: number;
  name: string;
  clientName: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  clientName: string;
  description?: string;
}

// ─── File ────────────────────────────────────────────────────────────────────

export type FileType = "WORKING" | "REPORT";

export interface FileItem {
  id: number;
  projectId: number;
  projectName: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  fileType: FileType;
  uploaderName: string;
  createdAt: string;
}

// ─── Share Link ───────────────────────────────────────────────────────────────

export interface ShareLinkDetail {
  id: number;
  fileId: number;
  token: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  filename: string;
  projectId: number;
  projectName: string;
}

export interface ShareLink {
  id: number;
  fileId: number;
  token: string;
  expiresAt: string;
  isActive: boolean;
  allowDownload: boolean;
  createdAt: string;
}

export interface SharedFileInfo {
  filename: string;
  fileSize: number;
  mimeType: string;
  expiresAt: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  status: number;
  code: "FORBIDDEN" | "NOT_FOUND" | "EXPIRED" | "UNAUTHORIZED" | "SERVER_ERROR";
  message: string;
}
