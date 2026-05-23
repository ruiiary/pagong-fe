"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { mockHandlers } from "@/lib/mock/handlers";
import { storeUser } from "@/lib/authStore";
import { colors, fontSize, fontWeight, radius, shadow } from "@/styles/tokens";

// ─── Styled ──────────────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.neutral[50]};
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  background: ${colors.neutral[0]};
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 40px 36px 36px;
  box-shadow: ${shadow.md};
`;

const Logo = styled.div`
  font-size: ${fontSize.h1};
  font-weight: ${fontWeight.semibold};
  color: ${colors.neutral[900]};
  margin-bottom: 4px;
  text-align: center;
`;

const LogoAccent = styled.span`
  color: ${colors.primary[600]};
`;

const Subtitle = styled.p`
  font-size: ${fontSize.bodySm};
  color: ${colors.neutral[400]};
  text-align: center;
  margin: 0 0 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: ${fontSize.bodySm};
  font-weight: ${fontWeight.medium};
  color: ${colors.neutral[700]};
`;

const Input = styled.input<{ $error?: boolean }>`
  padding: 10px 14px;
  border: 1px solid ${({ $error }) => ($error ? "#ef4444" : "#d1d5db")};
  border-radius: ${radius.md};
  font-size: ${fontSize.body};
  font-family: inherit;
  color: ${colors.neutral[900]};
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ $error }) => ($error ? "#ef4444" : colors.primary[600])};
    box-shadow: 0 0 0 3px
      ${({ $error }) => ($error ? "#fee2e2" : colors.primary[50])};
  }

  &::placeholder {
    color: ${colors.neutral[400]};
  }
`;

const ErrorMessage = styled.p`
  font-size: ${fontSize.caption};
  color: #ef4444;
  margin: 0;
`;

const SubmitButton = styled.button`
  margin-top: 8px;
  padding: 12px;
  background: ${colors.primary[600]};
  color: #fff;
  border: none;
  border-radius: ${radius.md};
  font-size: ${fontSize.body};
  font-weight: ${fontWeight.medium};
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: ${colors.primary[700]};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DevHint = styled.details`
  margin-top: 24px;
  border: 1px solid #fff5d0;
  border-radius: ${radius.md};
  background: #fdf9ed;
`;

const DevHintSummary = styled.summary`
  padding: 8px 12px;
  font-size: ${fontSize.caption};
  font-weight: ${fontWeight.medium};
  color: #909090;
  cursor: pointer;
`;

const DevAccount = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 6px 12px;
  background: none;
  border: none;
  font-size: ${fontSize.caption};
  font-family: inherit;
  color: #92400e;
  cursor: pointer;

  &:hover {
    background: #fef3c7;
  }
`;

// ─── Dev accounts ─────────────────────────────────────────────────────────────

const DEV_ACCOUNTS = [
  {
    label: "사원 (공유 권한 없음)",
    email: "employee@brandwave.com",
    password: "password1",
  },
  {
    label: "사원 (공유 권한 있음)",
    email: "employee2@brandwave.com",
    password: "password2",
  },
  {
    label: "팀장·임원",
    email: "manager@brandwave.com",
    password: "password3",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { user } = await mockHandlers.login(email, password);
      storeUser(user);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fillAccount = (acc: (typeof DEV_ACCOUNTS)[number]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  };

  return (
    <Page>
      <Card>
        <Logo>
          브랜드<LogoAccent>웨이브</LogoAccent>
        </Logo>
        <Subtitle>프로젝트 산출물 공유 시스템</Subtitle>

        <Form onSubmit={handleSubmit}>
          <Field>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              $error={!!error}
              autoComplete="email"
            />
          </Field>
          <Field>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              $error={!!error}
              autoComplete="current-password"
            />
          </Field>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <SubmitButton type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </SubmitButton>
        </Form>

        <DevHint>
          <DevHintSummary>개발 테스트 계정 보기</DevHintSummary>
          {DEV_ACCOUNTS.map((acc) => (
            <DevAccount
              key={acc.email}
              type="button"
              onClick={() => fillAccount(acc)}
            >
              {acc.label} — {acc.email}
            </DevAccount>
          ))}
        </DevHint>
      </Card>
    </Page>
  );
}
