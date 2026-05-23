"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import styled from "styled-components";
import { mockHandlers } from "@/lib/mock/handlers";
import { ApiError } from "@/types";
import { formatFileSize, formatDateTime } from "@/lib/utils";
import { fontSize } from "@/styles/tokens";

const Shell = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: 16px 32px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  font-size: ${fontSize.h3};
  font-weight: 700;
  color: #111827;
`;

const Body = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 480px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px;
`;

const CardTitle = styled.p`
  font-size: ${fontSize.body};
  color: #6b7280;
  margin: 0 0 20px;
`;

const FileName = styled.h1`
  font-size: ${fontSize.h1};
  font-weight: 700;
  color: #111827;
  margin: 0 0 20px;
  word-break: break-all;
`;

const MetaTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
`;

const MetaTh = styled.th`
  text-align: left;
  padding: 9px 0;
  font-size: ${fontSize.bodySm};
  font-weight: 600;
  color: #6b7280;
  width: 100px;
  border-bottom: 1px solid #f3f4f6;
`;

const MetaTd = styled.td`
  padding: 9px 0;
  font-size: ${fontSize.body};
  color: #111827;
  border-bottom: 1px solid #f3f4f6;
`;

const DownloadButton = styled.button`
  width: 100%;
  padding: 13px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: ${fontSize.h3};
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

const ProgressBar = styled.div<{ $pct: number }>`
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  margin-top: 12px;
  overflow: hidden;
  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: #2563eb;
    transition: width 0.3s;
  }
`;

const StateBox = styled.div`
  text-align: center;
  padding: 8px 0;
`;

const StateIcon = styled.div`
  font-size: 40px;
  margin-bottom: 16px;
`;

const StateTitle = styled.h2`
  font-size: ${fontSize.h2};
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
`;

const StateDesc = styled.p`
  font-size: ${fontSize.body};
  color: #6b7280;
  margin: 0 0 20px;
  line-height: 1.6;
`;

const RetryButton = styled.button`
  padding: 10px 24px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: ${fontSize.body};
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #1d4ed8;
  }
`;

const ErrorMsg = styled.p`
  font-size: ${fontSize.bodySm};
  color: #dc2626;
  margin: 10px 0 0;
  text-align: center;
`;

type PageState = "loading" | "valid" | "expired" | "not_found" | "error";

interface SharedFile {
  filename: string;
  fileSize: number;
  mimeType: string;
  expiresAt: string;
}

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [sharedFile, setSharedFile] = useState<SharedFile | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    mockHandlers
      .shareLink(token)
      .then((res) => {
        setSharedFile({
          filename: res.file.filename,
          fileSize: res.file.fileSize,
          mimeType: res.file.mimeType,
          expiresAt: res.expiresAt,
        });
        setPageState("valid");
      })
      .catch((e: ApiError) => {
        if (e.code === "EXPIRED") setPageState("expired");
        else if (e.code === "NOT_FOUND") setPageState("not_found");
        else setPageState("error");
      });
  }, [token]);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(false);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + 20));
    }, 300);
    try {
      const { downloadUrl } = await mockHandlers.downloadShared(token);
      clearInterval(interval);
      setProgress(100);
      window.open(downloadUrl, "_blank");
    } catch {
      clearInterval(interval);
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  };

  const renderBody = () => {
    if (pageState === "loading") {
      return (
        <StateBox>
          <StateIcon>⏳</StateIcon>
          <StateTitle>로딩 중...</StateTitle>
        </StateBox>
      );
    }

    if (pageState === "expired") {
      return (
        <StateBox>
          <StateIcon>⏰</StateIcon>
          <StateTitle>공유 링크가 만료되었습니다.</StateTitle>
          <StateDesc>
            이 링크는 유효 기간이 지나 더 이상 접근할 수 없습니다.
            <br />
            파일이 필요하시면 담당자에게 문의해 주세요.
          </StateDesc>
        </StateBox>
      );
    }

    if (pageState === "not_found") {
      return (
        <StateBox>
          <StateIcon>🔗</StateIcon>
          <StateTitle>접근할 수 없는 링크입니다.</StateTitle>
          <StateDesc>
            링크가 올바르지 않거나 삭제된 링크입니다.
            <br />
            담당자에게 링크를 다시 요청해 주세요.
          </StateDesc>
        </StateBox>
      );
    }

    if (pageState === "error") {
      return (
        <StateBox>
          <StateIcon>⚠️</StateIcon>
          <StateTitle>일시적인 오류가 발생했습니다.</StateTitle>
          <StateDesc>잠시 후 다시 시도해 주세요.</StateDesc>
          <RetryButton onClick={() => window.location.reload()}>
            새로고침
          </RetryButton>
        </StateBox>
      );
    }

    if (pageState === "valid" && sharedFile) {
      return (
        <>
          <CardTitle>파일이 공유되었습니다.</CardTitle>
          <FileName>📄 {sharedFile.filename}</FileName>
          <MetaTable>
            <tbody>
              <tr>
                <MetaTh>크기</MetaTh>
                <MetaTd>{formatFileSize(sharedFile.fileSize)}</MetaTd>
              </tr>
              <tr>
                <MetaTh>형식</MetaTh>
                <MetaTd>{sharedFile.mimeType}</MetaTd>
              </tr>
              <tr>
                <MetaTh>공유 만료</MetaTh>
                <MetaTd>{formatDateTime(sharedFile.expiresAt)}</MetaTd>
              </tr>
            </tbody>
          </MetaTable>

          <DownloadButton onClick={handleDownload} disabled={downloading}>
            {downloading ? "다운로드 중..." : "⬇ 파일 다운로드"}
          </DownloadButton>
          {downloading && <ProgressBar $pct={progress} />}
          {downloadError && (
            <>
              <ErrorMsg>
                ❌ 다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.
              </ErrorMsg>
              <RetryButton
                onClick={handleDownload}
                style={{ marginTop: 10, width: "100%" }}
              >
                다시 시도
              </RetryButton>
            </>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <Shell>
      <Header>브랜드웨이브</Header>
      <Body>
        <Card>{renderBody()}</Card>
      </Body>
    </Shell>
  );
}
