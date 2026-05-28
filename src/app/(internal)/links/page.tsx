"use client";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import { service } from "@/lib/api/service";
import { ShareLinkDetail } from "@/types";
import { getStoredUser } from "@/lib/authStore";
import { Loading } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDateTime } from "@/lib/utils";
import { fontSize } from "@/styles/tokens";

// ─── Styled ──────────────────────────────────────────────────────────────────

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: ${fontSize.display};
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const SummaryRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const SummaryChip = styled.div<{ $variant: "active" | "expiring" | "expired" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: ${fontSize.bodySm};
  font-weight: 600;
  background: ${({ $variant }) =>
    $variant === "active"
      ? "#e6fcee"
      : $variant === "expiring"
        ? "#f9f6d7"
        : "#f3f4f6"};
  color: ${({ $variant }) =>
    $variant === "active"
      ? "#166534"
      : $variant === "expiring"
        ? "#854d0e"
        : "#6b7280"};
`;

const SummaryDot = styled.span<{ $variant: "active" | "expiring" | "expired" }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $variant }) =>
    $variant === "active"
      ? "#16a34a"
      : $variant === "expiring"
        ? "#ca8a04"
        : "#9ca3af"};
`;

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

const Td = styled.td`
  padding: 14px 16px;
  font-size: ${fontSize.body};
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
`;

const FileLink = styled(Link)`
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const ProjectLink = styled(Link)`
  color: #374151;
  text-decoration: none;
  font-size: ${fontSize.bodySm};
  &:hover {
    text-decoration: underline;
  }
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: ${fontSize.caption};
  font-weight: 600;
  background: ${({ $active }) => ($active ? "#dcfce7" : "#f3f4f6")};
  color: ${({ $active }) => ($active ? "#166534" : "#6b7280")};
`;

const StatusDot = styled.span<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $active }) => ($active ? "#16a34a" : "#9ca3af")};
`;

const ExpiryText = styled.span<{ $urgent: boolean }>`
  color: ${({ $urgent }) => ($urgent ? "#dc2626" : "inherit")};
  font-weight: ${({ $urgent }) => ($urgent ? "600" : "400")};
`;

const CopyButton = styled.button`
  padding: 5px 12px;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: ${fontSize.caption};
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;

const CopiedText = styled.span`
  font-size: ${fontSize.caption};
  color: #16a34a;
  font-weight: 500;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysUntil(isoDate: string): number {
  return Math.ceil(
    (new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

function shareUrl(token: string): string {
  if (typeof window === "undefined") return `/share/${token}`;
  return `${window.location.origin}/share/${token}`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LinksPage() {
  const [links, setLinks] = useState<ShareLinkDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const currentUser = getStoredUser();
  const isManager = currentUser?.role === "MANAGER";

  const load = () => {
    setLoading(true);
    setError(false);
    // 팀장·임원은 전체 링크, 사원은 배정된 프로젝트 링크만
    const userId = isManager ? undefined : currentUser?.id;
    service
      .shareLinksAll(userId)
      .then(setLinks)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCopy = (link: ShareLinkDetail) => {
    navigator.clipboard.writeText(shareUrl(link.token));
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState onRetry={load} />;

  const activeLinks = links.filter((l) => l.isActive);
  const expiringLinks = activeLinks.filter((l) => daysUntil(l.expiresAt) <= 2);
  const expiredLinks = links.filter((l) => !l.isActive);

  return (
    <>
      <Header>
        <PageTitle>{isManager ? "링크 관리" : "프로젝트 공유 링크"}</PageTitle>
      </Header>

      <SummaryRow>
        <SummaryChip $variant="active">
          <SummaryDot $variant="active" />
          활성 링크 {activeLinks.length}개
        </SummaryChip>
        {expiringLinks.length > 0 && (
          <SummaryChip $variant="expiring">
            <SummaryDot $variant="expiring" />
            만료 임박 {expiringLinks.length}개 (2일 이내)
          </SummaryChip>
        )}
        {expiredLinks.length > 0 && (
          <SummaryChip $variant="expired">
            <SummaryDot $variant="expired" />
            만료됨 {expiredLinks.length}개
          </SummaryChip>
        )}
      </SummaryRow>

      {links.length === 0 ? (
        <EmptyState message="생성된 공유 링크가 없습니다." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>파일명</Th>
              <Th>프로젝트</Th>
              <Th>상태</Th>
              <Th>만료 일시</Th>
              <Th>생성 일시</Th>
              <Th>생성자</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {links.map((link) => {
              const days = daysUntil(link.expiresAt);
              const urgent = link.isActive && days <= 2;
              return (
                <tr key={link.id}>
                  <Td>
                    <FileLink href={`/files/${link.fileId}`}>
                      {link.filename}
                    </FileLink>
                  </Td>
                  <Td>
                    <ProjectLink href={`/projects/${link.projectId}`}>
                      {link.projectName}
                    </ProjectLink>
                  </Td>
                  <Td>
                    <StatusBadge $active={link.isActive}>
                      <StatusDot $active={link.isActive} />
                      {link.isActive ? "활성" : "만료됨"}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ExpiryText $urgent={urgent}>
                      {formatDateTime(link.expiresAt)}
                      {urgent && ` (D-${days})`}
                    </ExpiryText>
                  </Td>
                  <Td>{formatDateTime(link.createdAt)}</Td>
                  <Td>{link.createdByName}</Td>
                  <Td>
                    {link.isActive &&
                      (copiedId === link.id ? (
                        <CopiedText>복사됨</CopiedText>
                      ) : (
                        <CopyButton onClick={() => handleCopy(link)}>
                          링크 복사
                        </CopyButton>
                      ))}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </>
  );
}
