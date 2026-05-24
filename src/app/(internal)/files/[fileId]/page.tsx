"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import styled from "styled-components";
import Link from "next/link";
import { mockHandlers } from "@/lib/mock/handlers";
import { getStoredUser } from "@/lib/authStore";
import { FileItem, ShareLink, ApiError } from "@/types";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatFileSize, formatDateTime, fileTypeLabel } from "@/lib/utils";
import { fontSize } from "@/styles/tokens";
import { ShareLinkPanel } from "./ShareLinkPanel";

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

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 24px;
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
`;

const MetaTh = styled.th`
  text-align: left;
  padding: 10px 0;
  font-size: ${fontSize.bodySm};
  font-weight: 600;
  color: #6b7280;
  width: 120px;
  border-bottom: 1px solid #f3f4f6;
`;

const MetaTd = styled.td`
  padding: 10px 0;
  font-size: ${fontSize.body};
  color: #111827;
  border-bottom: 1px solid #f3f4f6;
`;

const DownloadButton = styled.button`
  width: 100%;
  padding: 12px;
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
  margin-top: 10px;
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

const ForbiddenBox = styled.div`
  background: #fff;
  border: 1px solid #fca5a5;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  color: #374151;
`;

const ForbiddenIcon = styled.div`
  font-size: 36px;
  margin-bottom: 12px;
`;

const ForbiddenMsg = styled.p`
  font-size: ${fontSize.h3};
  font-weight: 600;
  margin: 0 0 6px;
`;

const ForbiddenSub = styled.p`
  font-size: ${fontSize.bodySm};
  color: #9ca3af;
  margin: 0 0 20px;
`;

export default function FileDetailPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = use(params);
  const [file, setFile] = useState<FileItem | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const currentUser = getStoredUser();
  const role = currentUser?.role ?? "EMPLOYEE";

  const load = () => {
    setLoading(true);
    setForbidden(false);
    setError(false);
    mockHandlers
      .file(Number(fileId), role)
      .then(setFile)
      .catch((e: ApiError) => {
        if (e.code === "FORBIDDEN") setForbidden(true);
        else setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(false);
    try {
      const { downloadUrl } = await mockHandlers.downloadFile(
        Number(fileId),
        role,
      );
      window.open(downloadUrl, "_blank");
    } catch {
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <Loading />;

  if (forbidden) {
    return (
      <>
        <Breadcrumb>
          <Link href="/projects">프로젝트 목록</Link>
        </Breadcrumb>
        <ForbiddenBox>
          <ForbiddenIcon>🔒</ForbiddenIcon>
          <ForbiddenMsg>해당 파일에 접근 권한이 없습니다.</ForbiddenMsg>
          <ForbiddenSub>
            {fileTypeLabel("REPORT")} 파일은 팀장·임원만 조회할 수 있습니다.
          </ForbiddenSub>
          <Link
            href="/projects"
            style={{ color: "#2563eb", fontSize: fontSize.body }}
          >
            ← 돌아가기
          </Link>
        </ForbiddenBox>
      </>
    );
  }

  if (error) return <ErrorState onRetry={load} />;
  if (!file) return null;

  const canShare = role === "MANAGER_EXECUTIVE";

  return (
    <>
      <Breadcrumb>
        <Link href="/projects">프로젝트 목록</Link> /{" "}
        <Link href={`/projects/${file.projectId}`}>{file.projectName}</Link> /{" "}
        {file.originalFilename}
      </Breadcrumb>

      <Layout>
        <Card>
          <FileName>📄 {file.originalFilename}</FileName>
          <MetaTable>
            <tbody>
              <tr>
                <MetaTh>파일 유형</MetaTh>
                <MetaTd>{fileTypeLabel(file.fileType)}</MetaTd>
              </tr>
              <tr>
                <MetaTh>크기</MetaTh>
                <MetaTd>{formatFileSize(file.fileSize)}</MetaTd>
              </tr>
              <tr>
                <MetaTh>형식</MetaTh>
                <MetaTd>{file.mimeType}</MetaTd>
              </tr>
              <tr>
                <MetaTh>업로더</MetaTh>
                <MetaTd>{file.uploaderName}</MetaTd>
              </tr>
              <tr>
                <MetaTh>업로드 일시</MetaTh>
                <MetaTd>{formatDateTime(file.createdAt)}</MetaTd>
              </tr>
            </tbody>
          </MetaTable>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <DownloadButton onClick={handleDownload} disabled={downloading}>
              {downloading ? "다운로드 중..." : "⬇ 다운로드"}
            </DownloadButton>
            {downloading && <ProgressBar $pct={60} />}
            {downloadError && (
              <ErrorState
                message="다운로드에 실패했습니다."
                onRetry={handleDownload}
              />
            )}
          </Card>

          {canShare && <ShareLinkPanel fileId={file.id} role={role} />}
        </div>
      </Layout>
    </>
  );
}
