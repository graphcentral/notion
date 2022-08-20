import React from "react"
import ReactDOM from "react-dom"
import { ExampleImpure } from "./components/Example"
import { ThemeProvider } from '@emotion/react'
import { theme } from 'src/theme';

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <ExampleImpure color="#345345" />,
  </ThemeProvider>,
  document.getElementById(`root`)
)
