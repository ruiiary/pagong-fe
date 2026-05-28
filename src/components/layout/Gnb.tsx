"use client";
import styled from "styled-components";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/types";
import { clearUser } from "@/lib/authStore";
import {
  colors,
  radius,
  shadow,
  fontSize,
  fontWeight,
  layout,
} from "@/styles/tokens";

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: ${layout.gnbHeight};
  padding: 0 16px 0 24px;
  background: ${colors.neutral[0]};
  box-shadow: ${shadow.sm};
  gap: 8px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  font-size: ${fontSize.h2};
  font-weight: ${fontWeight.medium};
  color: ${colors.neutral[900]};
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  margin-right: 16px;
`;

const LogoAccent = styled.span`
  color: ${colors.primary[600]};
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 16px;
  border-radius: ${radius.pill};
  font-size: ${fontSize.bodySm};
  font-weight: ${({ $active }) =>
    $active ? fontWeight.medium : fontWeight.regular};
  color: ${({ $active }) =>
    $active ? colors.primary[600] : colors.neutral[500]};
  text-decoration: none;
  background: ${({ $active }) =>
    $active ? colors.primary[50] : "transparent"};
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: ${({ $active }) =>
      $active ? colors.primary[50] : colors.neutral[100]};
    color: ${({ $active }) =>
      $active ? colors.primary[600] : colors.neutral[900]};
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
`;

const UserName = styled.span`
  font-size: ${fontSize.bodySm};
  color: ${colors.neutral[500]};
`;

const LogoutButton = styled.button`
  padding: 4px 12px;
  background: none;
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${radius.pill};
  font-size: ${fontSize.caption};
  font-weight: ${fontWeight.medium};
  color: ${colors.neutral[500]};
  cursor: pointer;
  font-family: inherit;
  &:hover {
    background: ${colors.neutral[100]};
    color: ${colors.neutral[700]};
  }
`;

const Avatar = styled.div<{ $role: UserRole }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${fontSize.bodySm};
  font-weight: ${fontWeight.medium};
  background: ${({ $role }) =>
    $role === "EMPLOYEE" ? colors.primary[600] : "#f29900"};
  color: #fff;
  flex-shrink: 0;
`;

const RoleChip = styled.span<{ $role: UserRole }>`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: ${radius.pill};
  font-size: ${fontSize.overline};
  font-weight: ${fontWeight.medium};
  background: ${({ $role }) =>
    $role === "EMPLOYEE" ? colors.primary[50] : "#fef7e0"};
  color: ${({ $role }) =>
    $role === "EMPLOYEE" ? colors.primary[600] : "#b06000"};
`;

interface Props {
  userName: string;
  role: UserRole;
  canViewLinks?: boolean;
}

export function Gnb({ userName, role, canViewLinks }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const initial = userName.charAt(0);

  const handleLogout = () => {
    clearUser();
    router.replace("/login");
  };

  return (
    <Nav>
      <Logo href="/dashboard">
        브랜드<LogoAccent>웨이브</LogoAccent>
      </Logo>
      <NavLinks>
        <NavLink href="/dashboard" $active={pathname === "/dashboard"}>
          대시보드
        </NavLink>
        <NavLink href="/projects" $active={pathname.startsWith("/projects")}>
          프로젝트
        </NavLink>
        <NavLink href="/files/upload" $active={pathname === "/files/upload"}>
          파일 업로드
        </NavLink>
        {canViewLinks && (
          <NavLink href="/links" $active={pathname.startsWith("/links")}>
            링크 관리
          </NavLink>
        )}
      </NavLinks>
      <Spacer />
      <UserArea>
        <UserName>{userName}</UserName>
        <RoleChip $role={role}>
          {role === "EMPLOYEE" ? "사원" : "팀장·임원"}
        </RoleChip>
        <Avatar $role={role}>{initial}</Avatar>
        <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
      </UserArea>
    </Nav>
  );
}
