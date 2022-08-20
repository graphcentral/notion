import { css, Global, ThemeProvider } from "@emotion/react";
import React from "react";
import { GlobalStyle } from "src/globalStyle";
import { MainPage } from "src/pages/Main";
import { theme } from "src/theme";
import { enhance } from "src/utilities/essentials";

export const App = enhance(() => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <MainPage />
    </ThemeProvider>
  );
})();
