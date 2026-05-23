import { User, Project, FileItem, ShareLink } from "@/types";

export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 1,
    name: "김사원",
    email: "employee@brandwave.com",
    password: "password1",
    role: "EMPLOYEE",
  },
  {
    id: 2,
    name: "박사원",
    email: "employee2@brandwave.com",
    password: "password2",
    role: "EMPLOYEE",
    canCreateShareLink: true,
  },
  {
    id: 3,
    name: "이팀장",
    email: "manager@brandwave.com",
    password: "password3",
    role: "MANAGER_EXECUTIVE",
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    name: "A뷰티 여름 캠페인",
    clientName: "A뷰티",
    description: "여름 신제품 런칭을 위한 디지털 마케팅 캠페인",
    status: "ACTIVE",
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-05-19T14:32:00Z",
  },
  {
    id: 2,
    name: "B식품 SNS 광고",
    clientName: "B식품",
    description: "인스타그램·유튜브 숏폼 광고 콘텐츠 제작",
    status: "ACTIVE",
    createdAt: "2026-04-15T10:00:00Z",
    updatedAt: "2026-05-18T10:00:00Z",
  },
  {
    id: 3,
    name: "C패션 캠페인",
    clientName: "C패션",
    description: "가을 시즌 브랜드 캠페인",
    status: "ACTIVE",
    createdAt: "2026-05-01T09:00:00Z",
    updatedAt: "2026-05-16T09:15:00Z",
  },
];

export const MOCK_FILES: FileItem[] = [
  {
    id: 1,
    projectId: 1,
    projectName: "A뷰티 여름 캠페인",
    originalFilename: "A뷰티_배너시안_v1.png",
    fileSize: 1258291,
    mimeType: "image/png",
    fileType: "WORKING",
    uploaderName: "김사원",
    createdAt: "2026-05-19T14:32:00Z",
  },
  {
    id: 2,
    projectId: 1,
    projectName: "A뷰티 여름 캠페인",
    originalFilename: "A뷰티_최종시안.png",
    fileSize: 3565158,
    mimeType: "image/png",
    fileType: "WORKING",
    uploaderName: "이팀장",
    createdAt: "2026-05-18T10:00:00Z",
  },
  {
    id: 3,
    projectId: 1,
    projectName: "A뷰티 여름 캠페인",
    originalFilename: "A뷰티_보고서.pdf",
    fileSize: 2202009,
    mimeType: "application/pdf",
    fileType: "REPORT",
    uploaderName: "이팀장",
    createdAt: "2026-05-17T09:00:00Z",
  },
  {
    id: 4,
    projectId: 2,
    projectName: "B식품 SNS 광고",
    originalFilename: "B식품_영상초안.mp4",
    fileSize: 50331648,
    mimeType: "video/mp4",
    fileType: "WORKING",
    uploaderName: "김사원",
    createdAt: "2026-05-18T11:00:00Z",
  },
];

export const MOCK_SHARE_LINKS: ShareLink[] = [
  {
    id: 1,
    fileId: 2,
    token: "abc123def456",
    expiresAt: "2026-05-25T23:59:59Z",
    isActive: true,
    allowDownload: true,
    createdAt: "2026-05-19T10:00:00Z",
  },
  {
    id: 2,
    fileId: 1,
    token: "xyz789ghi000",
    expiresAt: "2026-05-24T23:59:59Z",
    isActive: true,
    allowDownload: true,
    createdAt: "2026-05-20T09:00:00Z",
  },
  {
    id: 3,
    fileId: 4,
    token: "expired-token-001",
    expiresAt: "2026-05-10T23:59:59Z",
    isActive: false,
    allowDownload: true,
    createdAt: "2026-05-07T14:00:00Z",
  },
];
