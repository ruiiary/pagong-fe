"use client";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import { service } from "@/lib/api/service";
import { getStoredUser } from "@/lib/authStore";
import { Project } from "@/types";
import { Loading } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDate } from "@/lib/utils";
import { fontSize } from "@/styles/tokens";
import { useRouter } from "next/navigation";

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: ${fontSize.display};
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const CreateButton = styled.button`
  padding: 9px 20px;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: ${fontSize.bodySm};
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 14px 16px;
  font-size: ${fontSize.body};
  color: #111827;
  border-bottom: 1px solid #f3f4f6;
`;

const ProjectLink = styled(Link)`
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const SubText = styled.span`
  font-size: ${fontSize.bodySm};
  color: #6b7280;
`;

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isManager, setIsManager] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    const currentUser = getStoredUser();
    const isManagerRole = currentUser?.role === "MANAGER";
    setIsManager(isManagerRole);
    const userId = isManagerRole ? undefined : currentUser?.id;
    service
      .projects(userId)
      .then(setProjects)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <>
      <PageHeader>
        <PageTitle>프로젝트 목록</PageTitle>
        {isManager && (
          <CreateButton onClick={() => router.push("/projects/create")}>
            + 프로젝트 생성
          </CreateButton>
        )}
      </PageHeader>
      {projects.length === 0 ? (
        <EmptyState message="아직 참여 중인 프로젝트가 없습니다." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>프로젝트명</Th>
              <Th>고객사</Th>
              <Th>생성일</Th>
              <Th>최근 업데이트</Th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.projectId}>
                <Td>
                  <ProjectLink href={`/projects/${p.projectId}`}>
                    📁 {p.name}
                  </ProjectLink>
                </Td>
                <Td>
                  <SubText>{p.clientName}</SubText>
                </Td>
                <Td>
                  <SubText>{formatDate(p.createdAt ?? "")}</SubText>
                </Td>
                <Td>
                  <SubText>{formatDate(p.updatedAt ?? "")}</SubText>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
