import { useTheme } from "@emotion/react";

export const theme = {
  colors: {
    darkPrimary: `#181818`,
    darkSecondary: `#131313`,
    whitePrimary: `#C9CACA`,
    whiteSecondary: `#898989`,
    whiteThird: `#2A2A2A`,
    whiteFourth: `#1D1D1D`,
    interactivePrimary: `#269AD3`,
    interactiveSecondary: `#138AC1`,
    interactiveText: `#FFFFFF`,
  },
  border: {
    smallRadius: `0.2rem`,
  },
} as const;

export function useTypedTheme(): typeof theme {
  return useTheme() as typeof theme;
}
