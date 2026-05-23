"use client";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Gnb } from "@/components/layout/Gnb";
import { DevRoleSelector } from "@/components/layout/DevRoleSelector";
import { getRole } from "@/lib/roleStore";
import { mockHandlers } from "@/lib/mock/handlers";
import { User } from "@/types";
import { colors, layout } from "@/styles/tokens";

const Main = styled.main`
  max-width: ${layout.maxWidth};
  margin: 0 auto;
  padding: ${layout.pagePadding};
  min-height: calc(100vh - 64px);
  background: ${colors.neutral[50]};
`;

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const role = getRole();
    mockHandlers.me(role).then(setUser);
  }, []);

  return (
    <>
      <DevRoleSelector />
      {user && <Gnb userName={user.name} role={user.role} />}
      <Main>{children}</Main>
    </>
  );
}
