"use client";
import styled, { keyframes } from "styled-components";
import { colors } from "@/styles/tokens";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
`;

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 3px solid ${colors.neutral[200]};
  border-top-color: ${colors.primary[600]};
  border-radius: 50%;
  animation: ${spin} 0.75s linear infinite;
`;

export function Loading() {
  return (
    <Wrapper>
      <Spinner />
    </Wrapper>
  );
}
