import React, { useCallback, useRef, useState } from 'react'
import { enhance } from "src/utilities/essentials"
import { css } from '@emotion/react'
import { useTypedTheme } from 'src/theme';
/** @jsx jsx */
import { jsx } from '@emotion/react'
import { CONSTANTS } from 'src/constants';

export const MainPage = enhance(() => {
  const theme = useTypedTheme()
  const [notionPublicPageLink, setNotionPublicPageLink] = useState(CONSTANTS.NOTION_HELP_PAGE)
  const onNotionPublicPageLinkChange: NonNullable<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>['onChange']> = useCallback((event) => {
    setNotionPublicPageLink(event.target.value)
  }, [])
  const troubleShootingSectionRef = useRef<HTMLElement | null>(null)
  const onClickProblems = useCallback(
    () => {
      if (!troubleShootingSectionRef.current) return

      troubleShootingSectionRef.current.scrollIntoView({
        behavior: `smooth`,
      })
    },
    [],
  )
  

  return <main
  css={{
    backgroundColor: theme.colors.darkSecondary,
    width: `100%`,
    height: `200%`,
    display: `flex`,
    justifyContent: `center`,
    alignItems: `center`,
    flexDirection: `column`
  }}
  >
    <section
      css={{
        width: `100%`,
        minHeight: `50%`,
        height: `50%`,
        maxHeight: `50%`,
        display: `flex`,
        justifyContent: `center`,
        alignItems: `center`,
        flexDirection: `column`
      }}
    >
    <h1
      css={{
        color: theme.colors.whitePrimary,
        fontSize: `2rem`,
        textAlign: `center`,
        marginTop: `auto`,
      }}
      >
      Enter your Notion page's public link here! 👇🏼
    </h1>
    <input 
      css={{
        width: `80%`,
        backgroundColor: theme.colors.darkPrimary,
        color: theme.colors.whitePrimary,
        padding: `1rem`,
        fontSize: `1rem`,
        border: `thin solid ${theme.colors.whiteThird}`,
        marginBottom: `auto`,
        '&:hover': {
          background: theme.colors.whiteFourth,
        },
      }}
      autoFocus
      defaultValue={notionPublicPageLink}
      placeholder={CONSTANTS.NOTION_HELP_PAGE}
      onChange={onNotionPublicPageLinkChange}
    />
    <button
      css={{
        background: theme.colors.darkPrimary,
        color: theme.colors.whitePrimary,
        border: `thin solid ${theme.colors.whiteThird}`,
        padding: `1rem`,
        marginBottom: `3rem`,
        cursor: `pointer`,
        '&:hover': {
          background: theme.colors.whiteFourth,
        }
      }}
      onClick={onClickProblems}
    >Problems? 🧐</button>
    </section>
    <section
      ref={troubleShootingSectionRef}
      css={{
        width: `100%`,
        height: `47%`,
        minHeight: `47%`,
      }}
    >
    <h2
      css={{
        color: theme.colors.whitePrimary,
        textAlign: `center`,
      }}
    >How to & Troubleshooting</h2>
    </section>
  </main>
})()