"use client";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { service } from "@/lib/api/service";
import { MOCK_SHARE_LINKS } from "@/lib/mock/data";
import { UserRole } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { fontSize } from "@/styles/tokens";

const Card = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
`;

const SectionTitle = styled.h3`
  font-size: ${fontSize.body};
  font-weight: 600;
  color: #374151;
  margin: 0 0 14px;
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
  margin-bottom: 10px;
`;

const StatusDot = styled.span<{ $active: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#16a34a" : "#9ca3af")};
  flex-shrink: 0;
`;

const LinkBox = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: ${fontSize.caption};
  color: #374151;
  word-break: break-all;
  margin-bottom: 8px;
`;

const ExpireText = styled.p`
  font-size: ${fontSize.caption};
  color: #6b7280;
  margin: 0 0 12px;
`;

const Button = styled.button<{ $variant?: "secondary" }>`
  width: 100%;
  padding: 9px;
  border-radius: 6px;
  font-size: ${fontSize.bodySm};
  font-weight: 600;
  cursor: pointer;
  border: ${({ $variant }) =>
    $variant === "secondary" ? "1px solid #d1d5db" : "none"};
  background: ${({ $variant }) =>
    $variant === "secondary" ? "#fff" : "#2563eb"};
  color: ${({ $variant }) => ($variant === "secondary" ? "#374151" : "#fff")};
  margin-bottom: 8px;
  &:hover:not(:disabled) {
    background: ${({ $variant }) =>
      $variant === "secondary" ? "#f9fafb" : "#1d4ed8"};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SelectRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const DayOption = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid ${({ $active }) => ($active ? "#2563eb" : "#d1d5db")};
  background: ${({ $active }) => ($active ? "#eff6ff" : "#fff")};
  color: ${({ $active }) => ($active ? "#2563eb" : "#374151")};
  font-size: ${fontSize.bodySm};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  cursor: pointer;
`;

const CopyConfirm = styled.span`
  font-size: ${fontSize.caption};
  color: #16a34a;
  margin-left: 8px;
`;

const ErrorMsg = styled.p`
  font-size: ${fontSize.bodySm};
  color: #dc2626;
  margin: 8px 0 0;
`;

interface ActiveLink {
  token: string;
  expiresAt: string;
  isActive: boolean;
}

interface Props {
  fileId: number;
  role: UserRole;
  inline?: boolean;
}

export function ShareLinkPanel({ fileId, role, inline = false }: Props) {
  const [activeLink, setActiveLink] = useState<ActiveLink | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [days, setDays] = useState(3);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const existing = MOCK_SHARE_LINKS.find(
      (l) => l.fileId === fileId && l.isActive,
    );
    if (existing) {
      setActiveLink({
        token: existing.token,
        expiresAt: existing.expiresAt,
        isActive: new Date(existing.expiresAt) > new Date(),
      });
    }
  }, [fileId]);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError("");
    try {
      const link = await service.createShareLink(fileId, days, role);
      setActiveLink({
        token: link.token,
        expiresAt: link.expiresAt,
        isActive: true,
      });
      setShowCreate(false);
    } catch (e: unknown) {
      setCreateError(
        (e as { message: string }).message ?? "링크 생성에 실패했습니다.",
      );
    } finally {
      setCreating(false);
    }
  };

  const shareUrl = (token: string) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/share/${token}`;

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(shareUrl(token));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Wrapper = inline ? "div" : Card;

  return (
    <Wrapper>
      {!inline && <SectionTitle>고객사 공유 링크</SectionTitle>}

      {activeLink && !showCreate ? (
        <>
          <StatusBadge $active={activeLink.isActive}>
            <StatusDot $active={activeLink.isActive} />
            {activeLink.isActive ? "활성" : "만료됨"}
          </StatusBadge>
          <LinkBox>{shareUrl(activeLink.token)}</LinkBox>
          <ExpireText>만료: {formatDateTime(activeLink.expiresAt)}</ExpireText>
          <Button onClick={() => handleCopy(activeLink.token)}>
            📋 링크 복사{copied && <CopyConfirm>복사됨!</CopyConfirm>}
          </Button>
          <Button $variant="secondary" onClick={() => setShowCreate(true)}>
            + 새 링크 생성
          </Button>
        </>
      ) : (
        <>
          {!showCreate ? (
            <Button onClick={() => setShowCreate(true)}>
              + 공유 링크 생성
            </Button>
          ) : (
            <>
              <p
                style={{
                  fontSize: fontSize.bodySm,
                  color: "#374151",
                  margin: "0 0 4px",
                  fontWeight: 600,
                }}
              >
                링크 만료 기간
              </p>
              <p
                style={{
                  fontSize: fontSize.caption,
                  color: "#9ca3af",
                  margin: "0 0 10px",
                }}
              >
                최대 7일 (AWS Presigned URL 제한)
              </p>
              <SelectRow>
                {[1, 3, 7].map((d) => (
                  <DayOption
                    key={d}
                    $active={days === d}
                    onClick={() => setDays(d)}
                  >
                    {d}일
                  </DayOption>
                ))}
              </SelectRow>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "생성 중..." : "생성"}
              </Button>
              <Button
                $variant="secondary"
                onClick={() => setShowCreate(false)}
                disabled={creating}
              >
                취소
              </Button>
              {createError && <ErrorMsg>{createError}</ErrorMsg>}
            </>
          )}
        </>
      )}
    </Wrapper>
  );
}
