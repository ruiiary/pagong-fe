// ─── User ───────────────────────────────────────────────────────────────────

export type UserRole = "EMPLOYEE" | "MANAGER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

// ─── Project ─────────────────────────────────────────────────────────────────

export type ProjectStatus = "ACTIVE" | "CLOSED";

export interface ProjectMember {
  userId: number;
  name: string;
  email: string;
  projectRole: "MEMBER" | "LEADER";
}

export interface Project {
  projectId: number;
  name: string;
  clientId?: number;
  clientName: string;
  status: ProjectStatus;
  myProjectRole?: "MEMBER" | "LEADER";
  description?: string;
  createdBy?: number;
  members?: ProjectMember[];
  // 목록 API에만 포함될 수 있는 필드
  createdAt?: string;
  updatedAt?: string;
  memberIds?: number[];
}

export interface CreateProjectInput {
  name: string;
  clientName: string;
  description?: string;
  members: { projectRole: "MEMBER" | "LEADER"; userId: number }[];
}

// ─── File ────────────────────────────────────────────────────────────────────

export type FileType = "WORKING" | "REPORT";

export interface FileItem {
  fileId: number;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  fileType: FileType;
  uploaderName: string;
  uploadedAt: string;
  projectId?: number;
  projectName?: string;
  createdAt?: string;
}

// ─── Share Link ───────────────────────────────────────────────────────────────

export interface ShareLinkDetail {
  id: number;
  fileId: number;
  token: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  createdById: number;
  createdByName: string;
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
  createdById: number;
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
