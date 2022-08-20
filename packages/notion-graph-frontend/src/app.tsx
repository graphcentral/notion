import { ThemeProvider } from '@emotion/react';
import React from 'react';
import { ExampleImpure } from 'src/components/Example';
import { theme } from 'src/theme';
import { enhance } from 'src/utilities/essentials';

export const App = enhance(() => {
  return <ThemeProvider theme={theme}>
  <ExampleImpure color="#345345" />,
</ThemeProvider> 
})()