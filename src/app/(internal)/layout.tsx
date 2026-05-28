"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Gnb } from "@/components/layout/Gnb";
import { getStoredUser } from "@/lib/authStore";
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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.replace("/login");
      return;
    }
    setUser(stored);
  }, [router]);

  if (!user) return null;

  return (
    <>
      <Gnb
        userName={user.name}
        role={user.role}
        canViewLinks={user.role === "MANAGER"}
      />
      <Main>{children}</Main>
    </>
  );
}
