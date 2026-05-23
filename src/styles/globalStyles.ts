import { createGlobalStyle } from "styled-components";
import { colors, fontSize } from "./tokens";

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    font-family: 'Google Sans', Roboto, -apple-system, 'Noto Sans KR', sans-serif;
    font-size: ${fontSize.body};
    color: ${colors.neutral[900]};
    background: ${colors.neutral[50]};
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }

  input, select, textarea {
    font-family: inherit;
    font-size: inherit;
  }
`;
