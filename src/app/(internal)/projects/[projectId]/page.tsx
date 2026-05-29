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
  ProjectMember,
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

const AddMemberLabel = styled.span`
  font-size: ${fontSize.bodySm};
  color: #6b7280;
`;

const FixedChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: ${fontSize.bodySm};
  font-weight: 500;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #9ca3af;
  cursor: default;
  user-select: none;
`;

const EmployeeChip = styled.button<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: ${fontSize.bodySm};
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  background: ${({ $selected }) => ($selected ? "#eff6ff" : "#f9fafb")};
  border: 1px solid ${({ $selected }) => ($selected ? "#bfdbfe" : "#d1d5db")};
  color: ${({ $selected }) => ($selected ? "#1d4ed8" : "#374151")};
  &:hover:not(:disabled) {
    background: ${({ $selected }) => ($selected ? "#dbeafe" : "#f3f4f6")};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MemberFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
`;

const SaveButton = styled.button`
  padding: 7px 20px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: ${fontSize.bodySm};
  font-weight: 600;
  cursor: pointer;
  &:hover:not(:disabled) {
    background: #1d4ed8;
  }
  &:disabled {
    background: #93c5fd;
    cursor: not-allowed;
  }
`;

const SaveError = styled.span`
  font-size: ${fontSize.caption};
  color: #dc2626;
`;

// ─── Data ────────────────────────────────────────────────────────────────────

type FilterType = "ALL" | FileType;

const TABS: { value: FilterType; label: string; roles: UserRole[] }[] = [
  { value: "ALL", label: "전체", roles: ["EMPLOYEE", "MANAGER"] },
  {
    value: "WORKING",
    label: "작업본",
    roles: ["EMPLOYEE", "MANAGER"],
  },
  { value: "REPORT", label: "보고본", roles: ["MANAGER"] },
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
  const [allEmployees, setAllEmployees] = useState<UserType[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberSaveError, setMemberSaveError] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (u) {
      setCurrentUser(u);
      setRole(u.role);
      if (u.role === "MANAGER") {
        service
          .allEmployees()
          .then(setAllEmployees)
          .catch(() => {});
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
        if (p.members) {
          setSelectedMemberIds(
            p.members
              .filter((m) => m.projectRole === "MEMBER")
              .map((m) => m.userId),
          );
        }
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

  const toggleMember = (userId: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
    setMemberSaveError(false);
  };

  const handleSaveMembers = async () => {
    setMemberLoading(true);
    setMemberSaveError(false);
    try {
      await service.updateStaffAssignees(Number(projectId), selectedMemberIds);
    } catch {
      setMemberSaveError(true);
    } finally {
      setMemberLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState onRetry={load} />;
  if (!project) return null;

  const canShare = role === "MANAGER";
  const visibleTabs = TABS.filter((t) => t.roles.includes(role));
  const filtered =
    filter === "ALL" ? files : files.filter((f) => f.fileType === filter);
  const selectedFile = files.find((f) => f.fileId === selectedFileId) ?? null;

  return (
    <>
      <Breadcrumb>
        <Link href="/projects">프로젝트 목록</Link> / {project.name}
      </Breadcrumb>
      <Header>
        <Title>
          {project.name}
          <Meta>고객사: {project.clientName}</Meta>
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
              <tr key={f.fileId}>
                {canShare && (
                  <TdCheck>
                    {f.fileType === "WORKING" && (
                      <Checkbox
                        type="checkbox"
                        checked={selectedFileId === f.fileId}
                        onChange={() => handleCheckbox(f.fileId)}
                        title="공유할 파일 선택"
                      />
                    )}
                  </TdCheck>
                )}
                <Td>
                  <FileLink href={`/files/${f.fileId}`}>
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
                <Td>{formatDate(f.uploadedAt)}</Td>
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
            <ShareLinkPanel fileId={selectedFile.fileId} role={role} inline />
          </ModalBox>
        </ModalOverlay>
      )}

      {canShare && (
        <MemberSection>
          <MemberSectionTitle>담당 사원 관리</MemberSectionTitle>
          <MemberList>
            {allEmployees.length === 0 ? (
              <AddMemberLabel>등록된 사원이 없습니다.</AddMemberLabel>
            ) : (
              allEmployees.map((u) => {
                const selected = selectedMemberIds.includes(u.id);
                return (
                  <EmployeeChip
                    key={u.id}
                    $selected={selected}
                    onClick={() => toggleMember(u.id)}
                    disabled={memberLoading}
                    title={selected ? "배정 해제" : "배정"}
                  >
                    {selected && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="1.5,5 4,7.5 8.5,2.5" />
                      </svg>
                    )}
                    {u.name}
                  </EmployeeChip>
                );
              })
            )}
          </MemberList>
          <MemberFooter>
            <AddMemberLabel>{selectedMemberIds.length}명 배정됨</AddMemberLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {memberSaveError && (
                <SaveError>저장에 실패했습니다. 다시 시도해주세요.</SaveError>
              )}
              <SaveButton onClick={handleSaveMembers} disabled={memberLoading}>
                {memberLoading ? "저장 중..." : "저장"}
              </SaveButton>
            </div>
          </MemberFooter>
        </MemberSection>
      )}
    </>
  );
}
