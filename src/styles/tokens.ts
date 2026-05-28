// 참조: Material Design 3 + Google Workspace 시각 언어

export const colors = {
  // Google Blue — 주요 액션, 링크, 활성 상태
  primary: {
    700: "#1557b0",
    600: "#1a73e8",
    50: "#e8f0fe",
  },

  // 구글 중립 (Cool Gray) — 텍스트, 테두리, 배경
  neutral: {
    900: "#202124", // 주요 텍스트
    700: "#3c4043", // 서브 텍스트 (진함)
    500: "#5f6368", // 보조 텍스트
    400: "#80868b", // disabled, placeholder
    200: "#dadce0", // 테두리
    100: "#f1f3f4", // hover 배경, 테이블 헤더
    50: "#f8f9fa", // 페이지 배경
    0: "#ffffff", // 카드, 패널 배경
  },

  // 시맨틱
  success: {
    700: "#137333",
    100: "#e6f4ea",
  },
  danger: {
    700: "#c5221f",
    100: "#fce8e6",
  },
  warn: {
    700: "#b06000",
    100: "#fef7e0",
  },
} as const;

// 역할 뱃지
export const roleBadge = {
  EMPLOYEE: { bg: colors.primary[50], text: colors.primary[600] },
  MANAGER: { bg: "#fef7e0", text: "#b06000" },
} as const;

// 파일 유형 뱃지
export const fileTypeBadge = {
  WORKING: { bg: colors.neutral[100], text: colors.neutral[500] },
  REPORT: { bg: "#fef7e0", text: "#b06000" },
  CLIENT_FINAL: { bg: colors.success[100], text: colors.success[700] },
} as const;

// 간격 — 4px 베이스
export const space = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  12: "48px",
} as const;

// 테두리 반경 — Google Drive 스타일은 pill 버튼이 특징
export const radius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  pill: "24px", // 버튼, 뱃지
  full: "9999px",
} as const;

// 그림자 — Material 3 elevation tonal
export const shadow = {
  none: "none",
  // 카드 기본 (elevation 1)
  sm: "0 1px 2px rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)",
  // 드롭다운, hover 카드 (elevation 2)
  md: "0 1px 2px rgba(60,64,67,0.30), 0 2px 6px 2px rgba(60,64,67,0.15)",
  // 모달, 다이얼로그 (elevation 4)
  lg: "0 2px 3px rgba(60,64,67,0.30), 0 6px 10px 4px rgba(60,64,67,0.15)",
} as const;

// 타이포그래피
export const fontSize = {
  display: "24px",
  h1: "20px",
  h2: "18px",
  h3: "16px",
  body: "14px",
  bodySm: "13px",
  caption: "13px",
  overline: "13px",
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
} as const;

// 레이아웃
export const layout = {
  maxWidth: "1280px",
  pagePadding: "24px 32px",
  gnbHeight: "64px",
  gridGap: "16px",
} as const;
