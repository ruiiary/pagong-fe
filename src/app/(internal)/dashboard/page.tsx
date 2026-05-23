"use client";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import { mockHandlers } from "@/lib/mock/handlers";
import { getRole } from "@/lib/roleStore";
import { Project, FileItem, ShareLinkDetail, UserRole } from "@/types";
import { Loading } from "@/components/ui/Loading";
import {
  formatFileSize,
  formatDate,
  formatDateTime,
  fileTypeLabel,
} from "@/lib/utils";
import { fontSize } from "@/styles/tokens";

// ─── Styled ──────────────────────────────────────────────────────────────────

const PageTitle = styled.h1`
  font-size: ${fontSize.display};
  font-weight: 700;
  color: #111827;
  margin: 0 0 24px;
`;

const Grid = styled.div<{ $cols: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols}, 1fr);
  gap: 24px;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
`;

const CardTitle = styled.h2`
  font-size: ${fontSize.h3};
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
  &:last-child {
    border-bottom: none;
  }
`;

const RowMain = styled.div`
  font-size: ${fontSize.body};
  color: #111827;
  font-weight: 500;
`;

const RowSub = styled.div`
  font-size: ${fontSize.caption};
  color: #9ca3af;
  margin-top: 2px;
`;

const ViewAll = styled(Link)`
  display: block;
  margin-top: 12px;
  font-size: ${fontSize.bodySm};
  color: #2563eb;
  text-decoration: none;
  text-align: right;
`;

const UploadButton = styled(Link)`
  display: inline-block;
  margin-top: 24px;
  padding: 12px 28px;
  background: #2563eb;
  color: #fff;
  border-radius: 8px;
  font-size: ${fontSize.h3};
  font-weight: 600;
  text-decoration: none;
  &:hover {
    background: #1d4ed8;
  }
`;

// Link card specific

const LinkRow = styled(Row)`
  align-items: flex-start;
  gap: 12px;
`;

const LinkMeta = styled.div`
  flex: 1;
  min-width: 0;
`;

const LinkFilename = styled.div`
  font-size: ${fontSize.body};
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LinkProject = styled.div`
  font-size: ${fontSize.caption};
  color: #9ca3af;
  margin-top: 2px;
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: ${fontSize.caption};
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  background: ${({ $active }) => ($active ? "#dcfce7" : "#f3f4f6")};
  color: ${({ $active }) => ($active ? "#166534" : "#6b7280")};
`;

const StatusDot = styled.span<{ $active: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $active }) => ($active ? "#16a34a" : "#9ca3af")};
`;

const ExpiryNote = styled.div<{ $urgent: boolean }>`
  font-size: ${fontSize.caption};
  margin-top: 3px;
  color: ${({ $urgent }) => ($urgent ? "#dc2626" : "#9ca3af")};
  font-weight: ${({ $urgent }) => ($urgent ? "600" : "400")};
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysUntil(isoDate: string): number {
  return Math.ceil(
    (new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>("EMPLOYEE");
  const [projects, setProjects] = useState<Project[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLinkDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentRole = getRole();
    setRole(currentRole);

    const requests: Promise<unknown>[] = [
      mockHandlers.projects(),
      mockHandlers.projectFiles(1, currentRole),
    ];
    if (currentRole === "MANAGER_EXECUTIVE") {
      requests.push(mockHandlers.shareLinksAll());
    }

    Promise.all(requests).then((results) => {
      setProjects((results[0] as Project[]).slice(0, 3));
      setFiles((results[1] as FileItem[]).slice(0, 3));
      if (currentRole === "MANAGER_EXECUTIVE") {
        setShareLinks((results[2] as ShareLinkDetail[]).slice(0, 4));
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  const isManager = role === "MANAGER_EXECUTIVE";

  return (
    <>
      <PageTitle>대시보드</PageTitle>
      <Grid $cols={isManager ? 3 : 2}>
        <Card>
          <CardTitle>최근 업로드 파일</CardTitle>
          {files.map((f) => (
            <Row key={f.id}>
              <div>
                <RowMain>
                  <Link
                    href={`/files/${f.id}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {f.originalFilename}
                  </Link>
                </RowMain>
                <RowSub>
                  {fileTypeLabel(f.fileType)} · {formatFileSize(f.fileSize)} ·{" "}
                  {formatDate(f.createdAt)}
                </RowSub>
              </div>
            </Row>
          ))}
          <ViewAll href="/projects">전체 보기 →</ViewAll>
        </Card>

        <Card>
          <CardTitle>진행 중인 프로젝트</CardTitle>
          {projects.map((p) => (
            <Row key={p.id}>
              <div>
                <RowMain>
                  <Link
                    href={`/projects/${p.id}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {p.name}
                  </Link>
                </RowMain>
                <RowSub>
                  {p.clientName} · {formatDate(p.updatedAt)}
                </RowSub>
              </div>
            </Row>
          ))}
          <ViewAll href="/projects">전체 보기 →</ViewAll>
        </Card>

        {isManager && (
          <Card>
            <CardTitle>공유 링크 현황</CardTitle>
            {shareLinks.length === 0 ? (
              <RowSub>생성된 링크가 없습니다.</RowSub>
            ) : (
              shareLinks.map((link) => {
                const days = daysUntil(link.expiresAt);
                const urgent = link.isActive && days <= 2;
                return (
                  <LinkRow key={link.id}>
                    <LinkMeta>
                      <LinkFilename>
                        <Link
                          href={`/files/${link.fileId}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {link.filename}
                        </Link>
                      </LinkFilename>
                      <LinkProject>{link.projectName}</LinkProject>
                      <ExpiryNote $urgent={urgent}>
                        {link.isActive
                          ? `만료 ${formatDateTime(link.expiresAt)}${urgent ? ` (D-${days})` : ""}`
                          : "만료됨"}
                      </ExpiryNote>
                    </LinkMeta>
                    <StatusBadge $active={link.isActive}>
                      <StatusDot $active={link.isActive} />
                      {link.isActive ? "활성" : "만료"}
                    </StatusBadge>
                  </LinkRow>
                );
              })
            )}
            <ViewAll href="/links">전체 보기 →</ViewAll>
          </Card>
        )}
      </Grid>

      <UploadButton href="/files/upload">+ 파일 업로드</UploadButton>
    </>
  );
}
