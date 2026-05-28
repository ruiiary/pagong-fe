"use client";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { UserRole } from "@/types";
import { getRole, setRole } from "@/lib/roleStore";
import { colors, fontSize, fontWeight, radius } from "@/styles/tokens";

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 24px;
  background: #fef7e0;
  border-bottom: 1px solid #fde68a;
  font-size: ${fontSize.caption};
  color: #b06000;
`;

const Label = styled.span`
  font-weight: ${fontWeight.medium};
`;

const Select = styled.select`
  padding: 3px 10px;
  border: 1px solid #fcd34d;
  border-radius: ${radius.pill};
  background: ${colors.neutral[0]};
  font-size: ${fontSize.caption};
  font-family: inherit;
  color: #b06000;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: #f29900;
  }
`;

const ROLES: { value: UserRole; label: string }[] = [
  { value: "EMPLOYEE", label: "사원" },
  { value: "MANAGER", label: "팀장·임원" },
];

export function DevRoleSelector() {
  const [role, setLocalRole] = useState<UserRole>("EMPLOYEE");

  useEffect(() => {
    setLocalRole(getRole());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as UserRole;
    setRole(next);
    setLocalRole(next);
    window.location.reload();
  };

  return (
    <Bar>
      <Label>개발서버 역할 선택</Label>
      <Select value={role} onChange={handleChange}>
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </Select>
      <span style={{ color: colors.neutral[400] }}>실제 배포 시 제거 필요</span>
    </Bar>
  );
}
