"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import styled from "styled-components";
import Link from "next/link";
import { service } from "@/lib/api/service";
import { getStoredUser } from "@/lib/authStore";
import { FileType, UserRole, Project } from "@/types";
import { formatFileSize, fileTypeLabel } from "@/lib/utils";
import { fontSize } from "@/styles/tokens";

const PageTitle = styled.h1`
  font-size: ${fontSize.display};
  font-weight: 700;
  color: #111827;
  margin: 0 0 24px;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 24px;
`;

const CardTitle = styled.h2`
  font-size: ${fontSize.h3};
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px;
`;

const DropZone = styled.div<{ $dragging: boolean }>`
  border: 2px dashed ${({ $dragging }) => ($dragging ? "#2563eb" : "#d1d5db")};
  border-radius: 8px;
  padding: 36px 24px;
  text-align: center;
  background: ${({ $dragging }) => ($dragging ? "#eff6ff" : "#f9fafb")};
  transition: all 0.15s;
  cursor: pointer;
`;

const DropIconWrap = styled.div`
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
`;

function UploadSvgIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      stroke="#9ca3af"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 26V16M14 22l6-6 6 6" />
      <path d="M10 30a8 8 0 01-2-15.7A12 12 0 0130 16a10 10 0 012 19.9" />
    </svg>
  );
}

function FileTypeSvgIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("video/")) {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polygon points="10,9 16,12 10,15" fill="#7c3aed" stroke="none" />
      </svg>
    );
  }
  if (mimeType === "application/pdf") {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#dc2626"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="8" y1="14" x2="16" y2="14" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    );
  }
  if (
    mimeType.includes("sheet") ||
    mimeType.includes("excel") ||
    mimeType.includes("csv")
  ) {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#16a34a"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
        <line x1="12" y1="13" x2="12" y2="17" />
      </svg>
    );
  }
  // 기본 (문서, 기타)
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b7280"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  );
}

const DropText = styled.p`
  font-size: ${fontSize.body};
  color: #6b7280;
  margin: 0 0 12px;
`;

const SelectFileButton = styled.button`
  padding: 8px 20px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: ${fontSize.body};
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const HintText = styled.p`
  font-size: ${fontSize.caption};
  color: #9ca3af;
  margin: 10px 0 0;
`;

/* 파일 목록 */

const FileList = styled.ul`
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FileItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const FileThumb = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.p`
  font-size: ${fontSize.bodySm};
  font-weight: 500;
  color: #111827;
  margin: 0 0 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileMeta = styled.p`
  font-size: ${fontSize.caption};
  color: #9ca3af;
  margin: 0;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  &:hover {
    color: #dc2626;
    background: #fef2f2;
  }
`;

/* 폼 */

const Label = styled.label`
  display: block;
  font-size: ${fontSize.bodySm};
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
`;

const Select = styled.select`
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: ${fontSize.body};
  background: #fff;
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${fontSize.body};
  color: #374151;
  cursor: pointer;
`;

const FieldGroup = styled.div`
  margin-bottom: 16px;
`;

const FieldError = styled.p`
  font-size: ${fontSize.caption};
  color: #dc2626;
  margin: 4px 0 0;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const SubmitButton = styled.button`
  padding: 10px 28px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: ${fontSize.body};
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

const CancelButton = styled(Link)`
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: ${fontSize.body};
  color: #374151;
  text-decoration: none;
  &:hover {
    background: #f9fafb;
  }
`;

const ProgressWrap = styled.div`
  margin-top: 16px;
`;

const ProgressLabel = styled.p`
  font-size: ${fontSize.bodySm};
  color: #6b7280;
  margin: 0 0 6px;
`;

const ProgressBar = styled.div<{ $pct: number }>`
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: #2563eb;
    transition: width 0.4s;
  }
`;

const ResultBox = styled.div<{ $success: boolean }>`
  padding: 20px;
  border-radius: 8px;
  background: ${({ $success }) => ($success ? "#f0fdf4" : "#fef2f2")};
  border: 1px solid ${({ $success }) => ($success ? "#bbf7d0" : "#fecaca")};
  color: ${({ $success }) => ($success ? "#166534" : "#dc2626")};
  font-size: ${fontSize.body};
`;

const SuccessFileList = styled.ul`
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SuccessFileItem = styled.li`
  font-size: ${fontSize.bodySm};
  display: flex;
  align-items: center;
  gap: 6px;
`;

/* 유틸 */

const FILE_TYPES_BY_ROLE: Record<string, FileType[]> = {
  EMPLOYEE: ["WORKING"],
  MANAGER_EXECUTIVE: ["WORKING", "REPORT"],
};

type UploadState = "idle" | "uploading" | "success" | "error";

function UploadPage() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<(string | null)[]>([]);
  const [projectId, setProjectId] = useState(
    searchParams.get("projectId") ?? "",
  );
  const [fileType, setFileType] = useState<FileType>("WORKING");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [role, setRole] = useState<UserRole>("EMPLOYEE");
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const user = getStoredUser();
    const currentRole = user?.role ?? "EMPLOYEE";
    setRole(currentRole);
    const userId = currentRole === "MANAGER_EXECUTIVE" ? undefined : user?.id;
    service.projects(userId).then(setProjects);
  }, []);

  // 이미지 미리보기 URL 생성 및 해제
  useEffect(() => {
    const urls = selectedFiles.map((f) =>
      f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    );
    setPreviews(urls);
    return () => {
      urls.forEach((u) => u && URL.revokeObjectURL(u));
    };
  }, [selectedFiles]);

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      return [...prev, ...arr.filter((f) => !existingNames.has(f.name))];
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (selectedFiles.length === 0)
      errs.file = "파일을 하나 이상 선택해 주세요.";
    if (!projectId) errs.projectId = "프로젝트를 선택해 주세요.";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setUploadState("uploading");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 15;
      });
    }, 300);

    try {
      await Promise.all(
        selectedFiles.map((file) =>
          service.uploadFile(Number(projectId), fileType, file, role),
        ),
      );
      clearInterval(interval);
      setProgress(100);
      setUploadState("success");
    } catch {
      clearInterval(interval);
      setUploadState("error");
    }
  };

  if (uploadState === "success") {
    return (
      <>
        <PageTitle>파일 업로드</PageTitle>
        <ResultBox $success>
          {selectedFiles.length}개 파일 업로드가 완료되었습니다.
          <SuccessFileList>
            {selectedFiles.map((f, i) => (
              <SuccessFileItem key={i}>
                <span>{f.name}</span>
                <span style={{ color: "#6b7280" }}>
                  ({formatFileSize(f.size)})
                </span>
              </SuccessFileItem>
            ))}
          </SuccessFileList>
        </ResultBox>
        <ActionRow style={{ marginTop: 16 }}>
          <SubmitButton
            onClick={() => {
              setUploadState("idle");
              setSelectedFiles([]);
            }}
          >
            계속 업로드
          </SubmitButton>
          <CancelButton href={`/projects/${projectId}`}>
            프로젝트로 이동
          </CancelButton>
        </ActionRow>
      </>
    );
  }

  return (
    <>
      <PageTitle>파일 업로드</PageTitle>
      <Layout>
        {/* 왼쪽: 파일 선택 + 미리보기 */}
        <Card>
          <CardTitle>파일 선택</CardTitle>
          <DropZone
            $dragging={dragging}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <DropIconWrap>
              <UploadSvgIcon />
            </DropIconWrap>
            <DropText>파일을 드래그하거나 클릭하여 선택해 주세요</DropText>
            <SelectFileButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              파일 선택
            </SelectFileButton>
            <HiddenInput
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  addFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />
            <HintText>
              이미지, 영상, PDF, 문서 · 최대 500MB · 여러 파일 동시 선택 가능
            </HintText>
          </DropZone>

          {errors.file && <FieldError>{errors.file}</FieldError>}

          {selectedFiles.length > 0 && (
            <FileList>
              {selectedFiles.map((f, i) => (
                <FileItem key={i}>
                  <FileThumb>
                    {previews[i] ? (
                      <ThumbImg src={previews[i]!} alt={f.name} />
                    ) : (
                      <FileTypeSvgIcon mimeType={f.type} />
                    )}
                  </FileThumb>
                  <FileInfo>
                    <FileName title={f.name}>{f.name}</FileName>
                    <FileMeta>{formatFileSize(f.size)}</FileMeta>
                  </FileInfo>
                  <RemoveButton
                    type="button"
                    onClick={() => removeFile(i)}
                    title="삭제"
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
                  </RemoveButton>
                </FileItem>
              ))}
            </FileList>
          )}

          {uploadState === "uploading" && (
            <ProgressWrap>
              <ProgressLabel>
                업로드 중... {selectedFiles.length}개 파일 · {progress}%
              </ProgressLabel>
              <ProgressBar $pct={progress} />
            </ProgressWrap>
          )}
          {uploadState === "error" && (
            <ResultBox $success={false} style={{ marginTop: 12 }}>
              ❌ 업로드에 실패했습니다. 네트워크 오류가 발생했습니다.
            </ResultBox>
          )}
        </Card>

        {/* 오른쪽: 파일 정보 */}
        <Card>
          <CardTitle>파일 정보</CardTitle>

          <FieldGroup>
            <Label>프로젝트 *</Label>
            <Select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">프로젝트 선택</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            {errors.projectId && <FieldError>{errors.projectId}</FieldError>}
          </FieldGroup>

          <FieldGroup>
            <Label>파일 유형 *</Label>
            <RadioGroup>
              {FILE_TYPES_BY_ROLE[role].map((t) => (
                <RadioLabel key={t}>
                  <input
                    type="radio"
                    name="fileType"
                    value={t}
                    checked={fileType === t}
                    onChange={() => setFileType(t)}
                  />
                  {fileTypeLabel(t)}
                </RadioLabel>
              ))}
            </RadioGroup>
          </FieldGroup>

          <ActionRow>
            <SubmitButton
              onClick={handleSubmit}
              disabled={uploadState === "uploading"}
            >
              {selectedFiles.length > 1
                ? `${selectedFiles.length}개 업로드`
                : "업로드"}
            </SubmitButton>
            <CancelButton href="/projects">취소</CancelButton>
          </ActionRow>
        </Card>
      </Layout>
    </>
  );
}

export default function UploadPageWrapper() {
  return (
    <Suspense>
      <UploadPage />
    </Suspense>
  );
}
