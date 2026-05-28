"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Link from "next/link";
import { service } from "@/lib/api/service";
import { getStoredUser } from "@/lib/authStore";
import { User } from "@/types";
import { fontSize } from "@/styles/tokens";

const PageTitle = styled.h1`
  font-size: ${fontSize.display};
  font-weight: 700;
  color: #111827;
  margin: 0 0 24px;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 32px;
  max-width: 640px;
`;

const FieldGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: ${fontSize.bodySm};
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: ${fontSize.body};
  background: #fff;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: ${fontSize.body};
  background: #fff;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
  font-family: inherit;
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const FieldError = styled.p`
  font-size: ${fontSize.caption};
  color: #dc2626;
  margin: 4px 0 0;
`;

const SectionTitle = styled.h2`
  font-size: ${fontSize.h3};
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
`;

const MemberSection = styled.div`
  margin-top: 28px;
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px;
`;

const MemberRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;

const MemberName = styled.span`
  font-size: ${fontSize.body};
  color: #111827;
  font-weight: 500;
`;

const MemberEmail = styled.span`
  font-size: ${fontSize.bodySm};
  color: #6b7280;
  margin-left: auto;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 28px;
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
  display: inline-flex;
  align-items: center;
  &:hover {
    background: #f9fafb;
  }
`;

const ErrorBanner = styled.div`
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: ${fontSize.body};
  margin-top: 16px;
`;

const ForbiddenBox = styled.div`
  padding: 40px 24px;
  text-align: center;
  color: #6b7280;
  font-size: ${fontSize.body};
`;

type EmployeeUser = { id: number; name: string; email: string };

export default function CreateProjectPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [employees, setEmployees] = useState<EmployeeUser[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    if (user?.role === "MANAGER") {
      // 사원 목록 조회 (멤버 선택용)
      service.projectMembers(0).catch(() => null);
      // mock에서 EMPLOYEE 유저 목록 직접 가져오기 위해 빈 프로젝트 멤버 조회 대신
      // 모든 프로젝트 조회 후 memberIds 합산하는 방식은 비효율 → 서버 API 연결 전까지
      // 프로젝트 멤버 관리 화면에서 쓰는 projectMembers 핸들러 재활용
      service.projectMembers(1).then((res) => {
        const all = [...res.members, ...res.nonMembers];
        setEmployees(all);
      });
    }
  }, []);

  const toggleMember = (id: number) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "프로젝트명을 입력해 주세요.";
    if (!clientName.trim()) errs.clientName = "고객사명을 입력해 주세요.";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setServerError("");
    setSubmitting(true);
    try {
      await service.createProject(
        {
          name: name.trim(),
          clientName: clientName.trim(),
          description: description.trim() || undefined,
          members: selectedMembers.map((userId) => ({
            projectRole: "MEMBER" as const,
            userId,
          })),
        },
        currentUser!.role,
      );
      router.push("/projects");
    } catch {
      setServerError(
        "프로젝트 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
      setSubmitting(false);
    }
  };

  if (!currentUser) return null;

  if (currentUser.role !== "MANAGER") {
    return (
      <ForbiddenBox>
        <p>프로젝트 생성 권한이 없습니다.</p>
        <CancelButton
          href="/projects"
          style={{ marginTop: 16, display: "inline-flex" }}
        >
          프로젝트 목록으로 돌아가기
        </CancelButton>
      </ForbiddenBox>
    );
  }

  return (
    <>
      <PageTitle>프로젝트 생성</PageTitle>
      <Card>
        <SectionTitle>기본 정보</SectionTitle>

        <FieldGroup>
          <Label htmlFor="name">프로젝트명 *</Label>
          <Input
            id="name"
            type="text"
            placeholder="예: A뷰티 여름 캠페인"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="clientName">고객사명 *</Label>
          <Input
            id="clientName"
            type="text"
            placeholder="예: A뷰티"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          {errors.clientName && <FieldError>{errors.clientName}</FieldError>}
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="description">프로젝트 설명</Label>
          <Textarea
            id="description"
            placeholder="프로젝트 목적이나 간략한 설명을 입력해 주세요. (선택)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FieldGroup>

        <MemberSection>
          <SectionTitle>담당 사원 지정</SectionTitle>
          {employees.length === 0 ? (
            <p style={{ fontSize: fontSize.bodySm, color: "#6b7280" }}>
              등록된 사원이 없습니다.
            </p>
          ) : (
            <MemberList>
              {employees.map((emp) => (
                <MemberRow key={emp.id}>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(emp.id)}
                    onChange={() => toggleMember(emp.id)}
                  />
                  <MemberName>{emp.name}</MemberName>
                  <MemberEmail>{emp.email}</MemberEmail>
                </MemberRow>
              ))}
            </MemberList>
          )}
        </MemberSection>

        {serverError && <ErrorBanner>{serverError}</ErrorBanner>}

        <ActionRow>
          <SubmitButton onClick={handleSubmit} disabled={submitting}>
            {submitting ? "생성 중..." : "프로젝트 생성"}
          </SubmitButton>
          <CancelButton href="/projects">취소</CancelButton>
        </ActionRow>
      </Card>
    </>
  );
}
