"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import styled from "styled-components";
import Link from "next/link";
import { service } from "@/lib/api/service";
import { getStoredUser } from "@/lib/authStore";
import {
  Project,
  FileItem,
  FileType,
  UserRole,
  User as UserType,
} from "@/types";
import { Loading } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatFileSize, formatDate, fileTypeLabel } from "@/lib/utils";
import { fontSize } from "@/styles/tokens";
import { ShareLinkPanel } from "@/app/(internal)/files/[fileId]/ShareLinkPanel";

// ─── Layout ─────────────────────────────────────────────────────────────────

const Breadcrumb = styled.div`
  font-size: ${fontSize.bodySm};
  color: #9ca3af;
  margin-bottom: 12px;
  a {
    color: #6b7280;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: ${fontSize.display};
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const Meta = styled.span`
  font-size: ${fontSize.bodySm};
  color: #9ca3af;
  margin-left: 12px;
  font-weight: 400;
`;

const UploadButton = styled(Link)`
  padding: 8px 20px;
  background: #2563eb;
  color: #fff;
  border-radius: 6px;
  font-size: ${fontSize.body};
  font-weight: 600;
  text-decoration: none;
  &:hover {
    background: #1d4ed8;
  }
`;

// ─── Filter Tabs ─────────────────────────────────────────────────────────────

const FilterTabs = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: none;
  background: none;
  font-size: ${fontSize.body};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color: ${({ $active }) => ($active ? "#2563eb" : "#6b7280")};
  border-bottom: 2px solid
    ${({ $active }) => ($active ? "#2563eb" : "transparent")};
  cursor: pointer;
  margin-bottom: -1px;
`;

// ─── Table ───────────────────────────────────────────────────────────────────

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: ${fontSize.bodySm};
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const ThCheck = styled(Th)`
  width: 44px;
  padding-right: 0;
`;

const Td = styled.td`
  padding: 14px 16px;
  font-size: ${fontSize.body};
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
`;

const TdCheck = styled(Td)`
  width: 44px;
  padding-right: 0;
`;

const FileLink = styled(Link)`
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const TypeBadge = styled.span<{ $type: FileType }>`
  padding: 2px 8px;
  border-radius: 99px;
  font-size: ${fontSize.caption};
  font-weight: 600;
  background: ${({ $type }) => ($type === "WORKING" ? "#dbeafe" : "#fef3c7")};
  color: ${({ $type }) => ($type === "WORKING" ? "#1d4ed8" : "#92400e")};
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
  cursor: pointer;
`;

// ─── Floating Action Bar ──────────────────────────────────────────────────────

const FloatingBar = styled.div`
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  background: #1e293b;
  color: #fff;
  border-radius: 12px;
  padding: 14px 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 200;
  white-space: nowrap;
`;

const FloatingFileName = styled.span`
  font-size: ${fontSize.body};
  color: #e2e8f0;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FloatingShareButton = styled.button`
  padding: 8px 18px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: ${fontSize.bodySm};
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    background: #1d4ed8;
  }
`;

const FloatingClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;
  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

// ─── Modal ───────────────────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 24px;
`;

const ModalBox = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
`;

const ModalTitle = styled.h2`
  font-size: ${fontSize.h2};
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
`;

const ModalFileName = styled.p`
  font-size: ${fontSize.bodySm};
  color: #6b7280;
  margin: 0 0 20px;
  word-break: break-all;
`;

const ModalCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 6px;
  flex-shrink: 0;
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

// ─── Member Management ───────────────────────────────────────────────────────

const MemberSection = styled.div`
  margin-top: 32px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
`;

const MemberSectionTitle = styled.h2`
  font-size: ${fontSize.h3};
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px;
`;

const MemberList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const MemberChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 99px;
  font-size: ${fontSize.bodySm};
  color: #1d4ed8;
  font-weight: 500;
`;

const RemoveChipButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: none;
  border: none;
  color: #93c5fd;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  &:hover {
    color: #1d4ed8;
    background: #dbeafe;
  }
`;

const AddMemberRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const AddMemberLabel = styled.span`
  font-size: ${fontSize.bodySm};
  color: #6b7280;
`;

const AddButton = styled.button`
  padding: 4px 12px;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 99px;
  font-size: ${fontSize.bodySm};
  color: #374151;
  cursor: pointer;
  &:hover {
    background: #f3f4f6;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ─── Data ────────────────────────────────────────────────────────────────────

type FilterType = "ALL" | FileType;

const TABS: { value: FilterType; label: string; roles: UserRole[] }[] = [
  { value: "ALL", label: "전체", roles: ["EMPLOYEE", "MANAGER_EXECUTIVE"] },
  {
    value: "WORKING",
    label: "작업본",
    roles: ["EMPLOYEE", "MANAGER_EXECUTIVE"],
  },
  { value: "REPORT", label: "보고본", roles: ["MANAGER_EXECUTIVE"] },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [role, setRole] = useState<UserRole>("EMPLOYEE");
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [members, setMembers] = useState<UserType[]>([]);
  const [nonMembers, setNonMembers] = useState<UserType[]>([]);
  const [memberLoading, setMemberLoading] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (u) {
      setCurrentUser(u);
      setRole(u.role);
      if (u.role === "MANAGER_EXECUTIVE") {
        service
          .projectMembers(Number(projectId))
          .then(({ members: m, nonMembers: nm }) => {
            setMembers(m);
            setNonMembers(nm);
          });
      }
    }
  }, [projectId]);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      service.project(Number(projectId)),
      service.projectFiles(Number(projectId), role),
    ])
      .then(([p, f]) => {
        setProject(p);
        setFiles(f);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, role]);

  const handleFilterChange = (value: FilterType) => {
    setFilter(value);
    setSelectedFileId(null);
  };

  const handleCheckbox = (fileId: number) => {
    setSelectedFileId((prev) => (prev === fileId ? null : fileId));
  };

  const closeModal = () => setShowShareModal(false);

  const handleAddMember = async (userId: number) => {
    setMemberLoading(true);
    await service.addProjectMember(Number(projectId), userId);
    const { members: m, nonMembers: nm } = await service.projectMembers(
      Number(projectId),
    );
    setMembers(m);
    setNonMembers(nm);
    setMemberLoading(false);
  };

  const handleRemoveMember = async (userId: number) => {
    setMemberLoading(true);
    await service.removeProjectMember(Number(projectId), userId);
    const { members: m, nonMembers: nm } = await service.projectMembers(
      Number(projectId),
    );
    setMembers(m);
    setNonMembers(nm);
    setMemberLoading(false);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState onRetry={load} />;
  if (!project) return null;

  const canShare = role === "MANAGER_EXECUTIVE";
  const visibleTabs = TABS.filter((t) => t.roles.includes(role));
  const filtered =
    filter === "ALL" ? files : files.filter((f) => f.fileType === filter);
  const selectedFile = files.find((f) => f.id === selectedFileId) ?? null;

  return (
    <>
      <Breadcrumb>
        <Link href="/projects">프로젝트 목록</Link> / {project.name}
      </Breadcrumb>
      <Header>
        <Title>
          {project.name}
          <Meta>
            고객사: {project.clientName} · 생성일{" "}
            {formatDate(project.createdAt)}
          </Meta>
        </Title>
        <UploadButton href={`/files/upload?projectId=${projectId}`}>
          + 파일 업로드
        </UploadButton>
      </Header>

      <FilterTabs>
        {visibleTabs.map((t) => (
          <Tab
            key={t.value}
            $active={filter === t.value}
            onClick={() => handleFilterChange(t.value)}
          >
            {t.label}
          </Tab>
        ))}
      </FilterTabs>

      {filtered.length === 0 ? (
        <EmptyState message="해당 유형의 파일이 없습니다." />
      ) : (
        <Table>
          <thead>
            <tr>
              {canShare && <ThCheck />}
              <Th>파일명</Th>
              <Th>유형</Th>
              <Th>크기</Th>
              <Th>업로더</Th>
              <Th>업로드 일시</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id}>
                {canShare && (
                  <TdCheck>
                    {f.fileType === "WORKING" && (
                      <Checkbox
                        type="checkbox"
                        checked={selectedFileId === f.id}
                        onChange={() => handleCheckbox(f.id)}
                        title="공유할 파일 선택"
                      />
                    )}
                  </TdCheck>
                )}
                <Td>
                  <FileLink href={`/files/${f.id}`}>
                    {f.originalFilename}
                  </FileLink>
                </Td>
                <Td>
                  <TypeBadge $type={f.fileType}>
                    {fileTypeLabel(f.fileType)}
                  </TypeBadge>
                </Td>
                <Td>{formatFileSize(f.fileSize)}</Td>
                <Td>{f.uploaderName}</Td>
                <Td>{formatDate(f.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {canShare && selectedFile && (
        <FloatingBar>
          <FloatingFileName>{selectedFile.originalFilename}</FloatingFileName>
          <FloatingShareButton onClick={() => setShowShareModal(true)}>
            고객사 공유 링크 생성
          </FloatingShareButton>
          <FloatingClearButton
            onClick={() => setSelectedFileId(null)}
            title="선택 해제"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </FloatingClearButton>
        </FloatingBar>
      )}

      {showShareModal && selectedFile && (
        <ModalOverlay onClick={closeModal}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>고객사 공유 링크</ModalTitle>
                <ModalFileName>{selectedFile.originalFilename}</ModalFileName>
              </div>
              <ModalCloseButton onClick={closeModal} title="닫기">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <line x1="4" y1="4" x2="14" y2="14" />
                  <line x1="14" y1="4" x2="4" y2="14" />
                </svg>
              </ModalCloseButton>
            </ModalHeader>
            <ShareLinkPanel fileId={selectedFile.id} role={role} inline />
          </ModalBox>
        </ModalOverlay>
      )}

      {canShare && (
        <MemberSection>
          <MemberSectionTitle>담당 사원 관리</MemberSectionTitle>
          <MemberList>
            {members.length === 0 ? (
              <AddMemberLabel>배정된 사원이 없습니다.</AddMemberLabel>
            ) : (
              members.map((m) => (
                <MemberChip key={m.id}>
                  {m.name}
                  <RemoveChipButton
                    onClick={() => handleRemoveMember(m.id)}
                    disabled={memberLoading}
                    title="배정 해제"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      <line x1="2" y1="2" x2="8" y2="8" />
                      <line x1="8" y1="2" x2="2" y2="8" />
                    </svg>
                  </RemoveChipButton>
                </MemberChip>
              ))
            )}
          </MemberList>
          {nonMembers.length > 0 && (
            <AddMemberRow>
              <AddMemberLabel>사원 추가:</AddMemberLabel>
              {nonMembers.map((u) => (
                <AddButton
                  key={u.id}
                  onClick={() => handleAddMember(u.id)}
                  disabled={memberLoading}
                >
                  + {u.name}
                </AddButton>
              ))}
            </AddMemberRow>
          )}
        </MemberSection>
      )}
    </>
  );
}
