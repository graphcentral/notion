import React from 'react'
import { css, Global } from '@emotion/react';
/** @jsx jsx */
import { jsx } from '@emotion/react'
import { useTypedTheme } from 'src/theme';

export const GlobalStyle = () => {
  const theme = useTypedTheme()
return <Global
  styles={css`
    html, body, #root {
      width: 100%;
      height: 100%;
    }
    * {
      margin: 0;
      padding: 0;
      // https://www.reddit.com/r/Notion/comments/hss9no/which_font_is_notion_using/
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
      -webkit-user-select: none; /* Safari */
      -ms-user-select: none; /* IE 10 and IE 11 */
      user-select: none; /* Standard syntax */
      color: ${theme.colors.whitePrimary}
    }
  `}
/>
}