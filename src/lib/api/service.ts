//
// 통합 서비스 레이어
//
// NEXT_PUBLIC_API_BASE_URL 환경변수가 설정된 경우 → 실제 서버 API (axios)
// 설정되지 않은 경우 → Mock 핸들러
//
// 페이지에서는 이 파일만 import하면 됩니다:
//   import { service } from "@/lib/api/service";
//

import { authApi } from "./auth";
import { projectsApi } from "./projects";
import { filesApi } from "./files";
import { usersApi } from "./users";
import { mockHandlers } from "@/lib/mock/handlers";
import { UserRole, ShareLinkDetail, User } from "@/types";

const USE_REAL_API = !!process.env.NEXT_PUBLIC_API_BASE_URL;

export const service = {
  // ─── Auth ──────────────────────────────────────────────────────────────────

  login: (
    email: string,
    password: string,
  ): Promise<{ token: string; user: User }> =>
    USE_REAL_API
      ? authApi.login(email, password)
      : mockHandlers.login(email, password),

  // ─── Projects ──────────────────────────────────────────────────────────────

  // userId는 mock 전용 (서버는 JWT로 자동 필터)
  createProject: (
    input: import("@/types").CreateProjectInput,
    role: import("@/types").UserRole,
  ) =>
    USE_REAL_API
      ? projectsApi.create(input)
      : mockHandlers.createProject(input, role),

  projects: (userId?: number) =>
    USE_REAL_API ? projectsApi.list() : mockHandlers.projects(userId),

  project: (projectId: number) =>
    USE_REAL_API ? projectsApi.get(projectId) : mockHandlers.project(projectId),

  // role은 mock 전용 (서버는 JWT로 자동 필터), fileType은 공통
  projectFiles: (
    projectId: number,
    role: UserRole,
    fileType?: string | null,
  ) =>
    USE_REAL_API
      ? projectsApi.files(projectId, fileType)
      : mockHandlers.projectFiles(projectId, role, fileType),

  // role은 mock 전용
  uploadFile: (
    projectId: number,
    fileType: string,
    file: File,
    role: UserRole,
  ) =>
    USE_REAL_API
      ? projectsApi.uploadFile(projectId, fileType, file)
      : mockHandlers.uploadFile(projectId, fileType, file, role),

  // ─── Files ─────────────────────────────────────────────────────────────────

  // role은 mock 전용
  file: (fileId: number, role: UserRole) =>
    USE_REAL_API ? filesApi.get(fileId) : mockHandlers.file(fileId, role),

  downloadFile: (fileId: number, role: UserRole) =>
    USE_REAL_API
      ? filesApi.download(fileId)
      : mockHandlers.downloadFile(fileId, role),

  // ─── Share Links (API 미수신 → mock 고정) ──────────────────────────────────

  createShareLink: (fileId: number, expiresInDays: number, role: UserRole) =>
    USE_REAL_API
      ? filesApi.createShareLink(fileId, expiresInDays)
      : mockHandlers.createShareLink(fileId, expiresInDays, role),

  shareLinksAll: (userId?: number): Promise<ShareLinkDetail[]> =>
    USE_REAL_API
      ? filesApi.listShareLinks()
      : mockHandlers.shareLinksAll(userId),

  shareLink: (token: string) => mockHandlers.shareLink(token),

  downloadShared: (token: string) => mockHandlers.downloadShared(token),

  // ─── Project Members ───────────────────────────────────────────────────────

  // GET은 mock 고정 (서버 미제공), PUT은 실제 API 사용
  allEmployees: () =>
    USE_REAL_API ? usersApi.list("EMPLOYEE") : mockHandlers.allEmployees(),

  projectMembers: (projectId: number) => mockHandlers.projectMembers(projectId),

  updateMembers: (projectId: number, memberUserIds: number[]) =>
    USE_REAL_API
      ? projectsApi.updateMembers(projectId, memberUserIds)
      : mockHandlers.updateMembers(projectId, memberUserIds),
};
