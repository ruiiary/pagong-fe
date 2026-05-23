"use client";
import styled from "styled-components";
import { colors, fontSize, fontWeight, radius } from "@/styles/tokens";

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
  color: ${colors.neutral[500]};
`;

const RetryButton = styled.button`
  margin-top: 8px;
  height: 36px;
  padding: 0 24px;
  background: ${colors.primary[600]};
  color: #fff;
  border: none;
  border-radius: ${radius.pill};
  font-size: ${fontSize.bodySm};
  font-weight: ${fontWeight.medium};
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${colors.primary[700]};
  }
`;

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "오류가 발생했습니다.",
  onRetry,
}: Props) {
  return (
    <Wrapper>
      <Icon>⚠️</Icon>
      <Message>{message}</Message>
      {onRetry && <RetryButton onClick={onRetry}>다시 시도</RetryButton>}
    </Wrapper>
  );
}
