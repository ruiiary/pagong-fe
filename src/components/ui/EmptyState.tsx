"use client";
import styled from "styled-components";
import { colors, fontSize } from "@/styles/tokens";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 8px;
`;

const Icon = styled.div`
  font-size: 28px;
  margin-bottom: 4px;
`;

const Message = styled.p`
  margin: 0;
  font-size: ${fontSize.body};
  color: ${colors.neutral[400]};
`;

interface Props {
  message?: string;
}

export function EmptyState({ message = "데이터가 없습니다." }: Props) {
  return (
    <Wrapper>
      <Message>{message}</Message>
    </Wrapper>
  );
}
