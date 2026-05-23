import {
  MOCK_USERS,
  MOCK_PROJECTS,
  MOCK_FILES,
  MOCK_SHARE_LINKS,
} from "./data";
import {
  UserRole,
  FileType,
  CreateProjectInput,
  ShareLinkDetail,
} from "@/types";

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

function getCurrentUser(role: UserRole) {
  return MOCK_USERS.find((u) => u.role === role) ?? MOCK_USERS[0];
}

function getUserByEmail(email: string) {
  return MOCK_USERS.find((u) => u.email === email) ?? null;
}

function canAccessFile(fileType: FileType, role: UserRole): boolean {
  if (fileType === "WORKING") return true;
  if (fileType === "REPORT") return role === "MANAGER_EXECUTIVE";
  return false;
}

export const mockHandlers = {
  login: async (email: string, _password: string) => {
    await delay();
    const user = getUserByEmail(email);
    if (!user)
      throw {
        status: 401,
        code: "UNAUTHORIZED",
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      };
    const { password: _, ...userWithoutPassword } = user;
    return { token: `mock-token-${user.id}`, user: userWithoutPassword };
  },

  me: async (role: UserRole) => {
    await delay(200);
    return getCurrentUser(role);
  },

  createProject: async (input: CreateProjectInput, role: UserRole) => {
    await delay();
    if (role !== "MANAGER_EXECUTIVE")
      throw {
        status: 403,
        code: "FORBIDDEN",
        message: "프로젝트 생성 권한이 없습니다.",
      };
    const now = new Date().toISOString();
    const newProject = {
      id: MOCK_PROJECTS.length + 1,
      name: input.name,
      clientName: input.clientName,
      description: input.description ?? "",
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    MOCK_PROJECTS.push(newProject);
    return newProject;
  },

  projects: async () => {
    await delay();
    return MOCK_PROJECTS;
  },

  project: async (projectId: number) => {
    await delay();
    const project = MOCK_PROJECTS.find((p) => p.id === projectId);
    if (!project)
      throw {
        status: 404,
        code: "NOT_FOUND",
        message: "프로젝트를 찾을 수 없습니다.",
      };
    return project;
  },

  projectFiles: async (projectId: number, role: UserRole) => {
    await delay();
    return MOCK_FILES.filter(
      (f) => f.projectId === projectId && canAccessFile(f.fileType, role),
    );
  },

  file: async (fileId: number, role: UserRole) => {
    await delay();
    const file = MOCK_FILES.find((f) => f.id === fileId);
    if (!file)
      throw {
        status: 404,
        code: "NOT_FOUND",
        message: "파일을 찾을 수 없습니다.",
      };
    if (!canAccessFile(file.fileType, role))
      throw {
        status: 403,
        code: "FORBIDDEN",
        message: "해당 파일에 접근 권한이 없습니다.",
      };
    return file;
  },

  downloadFile: async (fileId: number, role: UserRole) => {
    await delay(800);
    const file = MOCK_FILES.find((f) => f.id === fileId);
    if (!file)
      throw {
        status: 404,
        code: "NOT_FOUND",
        message: "파일을 찾을 수 없습니다.",
      };
    if (!canAccessFile(file.fileType, role))
      throw {
        status: 403,
        code: "FORBIDDEN",
        message: "다운로드 권한이 없습니다.",
      };
    return { downloadUrl: `https://mock-storage.example.com/files/${fileId}` };
  },

  createShareLink: async (
    fileId: number,
    expiresInDays: number,
    role: UserRole,
  ) => {
    await delay();
    if (role !== "MANAGER_EXECUTIVE")
      throw {
        status: 403,
        code: "FORBIDDEN",
        message: "공유 링크 생성 권한이 없습니다.",
      };
    const file = MOCK_FILES.find((f) => f.id === fileId);
    if (!file)
      throw {
        status: 404,
        code: "NOT_FOUND",
        message: "파일을 찾을 수 없습니다.",
      };
    const expiresAt = new Date(
      Date.now() + expiresInDays * 86400000,
    ).toISOString();
    const token = `mock-token-${fileId}-${Date.now()}`;
    return {
      id: 99,
      fileId,
      token,
      expiresAt,
      isActive: true,
      allowDownload: true,
      createdAt: new Date().toISOString(),
    };
  },

  shareLink: async (token: string) => {
    await delay();
    const link = MOCK_SHARE_LINKS.find((l) => l.token === token);
    if (!link)
      throw {
        status: 404,
        code: "NOT_FOUND",
        message: "접근할 수 없는 링크입니다.",
      };
    if (!link.isActive || new Date(link.expiresAt) < new Date())
      throw {
        status: 410,
        code: "EXPIRED",
        message: "공유 링크가 만료되었습니다.",
      };
    const file = MOCK_FILES.find((f) => f.id === link.fileId)!;
    return {
      file: {
        filename: file.originalFilename,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
      },
      expiresAt: link.expiresAt,
    };
  },

  downloadShared: async (token: string) => {
    await delay(800);
    const link = MOCK_SHARE_LINKS.find((l) => l.token === token);
    if (!link)
      throw {
        status: 404,
        code: "NOT_FOUND",
        message: "접근할 수 없는 링크입니다.",
      };
    if (!link.isActive || new Date(link.expiresAt) < new Date())
      throw {
        status: 410,
        code: "EXPIRED",
        message: "공유 링크가 만료되었습니다.",
      };
    return { downloadUrl: `https://mock-storage.example.com/shared/${token}` };
  },

  shareLinksAll: async (): Promise<ShareLinkDetail[]> => {
    await delay(300);
    return MOCK_SHARE_LINKS.map((link) => {
      const file = MOCK_FILES.find((f) => f.id === link.fileId)!;
      const project = MOCK_PROJECTS.find((p) => p.id === file.projectId)!;
      return {
        id: link.id,
        fileId: link.fileId,
        token: link.token,
        expiresAt: link.expiresAt,
        isActive: link.isActive && new Date(link.expiresAt) > new Date(),
        createdAt: link.createdAt,
        filename: file.originalFilename,
        projectId: project.id,
        projectName: project.name,
      };
    });
  },
};
