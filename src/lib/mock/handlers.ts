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
      memberIds: [] as number[],
    };
    MOCK_PROJECTS.push(newProject);
    return newProject;
  },

  projects: async (userId?: number) => {
    await delay();
    if (userId === undefined) return MOCK_PROJECTS;
    return MOCK_PROJECTS.filter((p) => p.memberIds.includes(userId));
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

  shareLinksAll: async (userId?: number): Promise<ShareLinkDetail[]> => {
    await delay(300);
    let filtered = MOCK_SHARE_LINKS;
    if (userId !== undefined) {
      // employee: only links for projects they are assigned to
      const assignedProjectIds = MOCK_PROJECTS.filter((p) =>
        p.memberIds.includes(userId),
      ).map((p) => p.id);
      filtered = MOCK_SHARE_LINKS.filter((l) => {
        const file = MOCK_FILES.find((f) => f.id === l.fileId);
        return file ? assignedProjectIds.includes(file.projectId) : false;
      });
    }
    return filtered.map((link) => {
      const file = MOCK_FILES.find((f) => f.id === link.fileId)!;
      const project = MOCK_PROJECTS.find((p) => p.id === file.projectId)!;
      const creator = MOCK_USERS.find((u) => u.id === link.createdById)!;
      return {
        id: link.id,
        fileId: link.fileId,
        token: link.token,
        expiresAt: link.expiresAt,
        isActive: link.isActive && new Date(link.expiresAt) > new Date(),
        createdAt: link.createdAt,
        createdById: link.createdById,
        createdByName: creator?.name ?? "알 수 없음",
        filename: file.originalFilename,
        projectId: project.id,
        projectName: project.name,
      };
    });
  },

  projectMembers: async (projectId: number) => {
    await delay(200);
    const project = MOCK_PROJECTS.find((p) => p.id === projectId);
    if (!project)
      throw {
        status: 404,
        code: "NOT_FOUND",
        message: "프로젝트를 찾을 수 없습니다.",
      };
    const employees = MOCK_USERS.filter((u) => u.role === "EMPLOYEE");
    return {
      members: employees
        .filter((u) => project.memberIds.includes(u.id))
        .map(({ password: _, ...u }) => u),
      nonMembers: employees
        .filter((u) => !project.memberIds.includes(u.id))
        .map(({ password: _, ...u }) => u),
    };
  },

  addProjectMember: async (projectId: number, userId: number) => {
    await delay(300);
    const project = MOCK_PROJECTS.find((p) => p.id === projectId);
    if (!project)
      throw {
        status: 404,
        code: "NOT_FOUND",
        message: "프로젝트를 찾을 수 없습니다.",
      };
    if (!project.memberIds.includes(userId)) project.memberIds.push(userId);
    return { ok: true };
  },

  removeProjectMember: async (projectId: number, userId: number) => {
    await delay(300);
    const project = MOCK_PROJECTS.find((p) => p.id === projectId);
    if (!project)
      throw {
        status: 404,
        code: "NOT_FOUND",
        message: "프로젝트를 찾을 수 없습니다.",
      };
    project.memberIds = project.memberIds.filter((id) => id !== userId);
    return { ok: true };
  },
};
