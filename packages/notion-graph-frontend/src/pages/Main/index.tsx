import React, { useCallback, useRef, useState } from "react";
import { enhance } from "src/utilities/essentials";
import { css } from "@emotion/react";
import { useTypedTheme } from "src/theme";
/** @jsx jsx */
import { jsx } from "@emotion/react";
import { CONSTANTS } from "src/constants";
import Guide0Image from "src/assets/guide0.png";

export const MainPage = enhance(() => {
  const theme = useTypedTheme();
  const [notionPublicPageLink, setNotionPublicPageLink] = useState(
    CONSTANTS.NOTION_HELP_PAGE
  );
  const onNotionPublicPageLinkChange: NonNullable<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >[`onChange`]
  > = useCallback((event) => {
    setNotionPublicPageLink(event.target.value);
  }, []);
  const troubleShootingSectionRef = useRef<HTMLElement | null>(null);
  const onClickProblems = useCallback(() => {
    if (!troubleShootingSectionRef.current) return;

    troubleShootingSectionRef.current.scrollIntoView({
      behavior: `smooth`,
    });
  }, []);

  return (
    <main
      css={{
        backgroundColor: theme.colors.darkSecondary,
        width: `100%`,
        height: `200%`,
        display: `flex`,
        justifyContent: `center`,
        alignItems: `center`,
        flexDirection: `column`,
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
          flexDirection: `column`,
        }}
      >
        <h1
          css={{
            color: theme.colors.whitePrimary,
            fontSize: `2rem`,
            textAlign: `center`,
            marginTop: `auto`,
            padding: `0 0.5rem`,
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
            borderRadius: theme.border.smallRadius,
            "&:hover": {
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
            background: theme.colors.interactivePrimary,
            color: theme.colors.interactiveText,
            border: `none`,
            borderRadius: theme.border.smallRadius,
            padding: `1rem`,
            marginTop: `1rem`,
            marginBottom: `auto`,
            cursor: `pointer`,
            "&:hover": {
              background: theme.colors.interactiveSecondary,
            },
          }}
          onClick={onClickProblems}
        >
          Create my knowledge graph
        </button>
        <button
          css={{
            background: theme.colors.darkPrimary,
            color: theme.colors.whitePrimary,
            border: `thin solid ${theme.colors.whiteThird}`,
            borderRadius: theme.border.smallRadius,
            padding: `1rem`,
            marginBottom: `3rem`,
            cursor: `pointer`,
            "&:hover": {
              background: theme.colors.whiteFourth,
            },
          }}
          onClick={onClickProblems}
        >
          Problems? 🧐
        </button>
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
        >
          How to & Troubleshooting
        </h2>
        <article
          css={{
            padding: `1rem`,
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,
          }}
        >
          <h3
            css={{
              color: theme.colors.whitePrimary,
              width: `100%`,
            }}
          >
            1. Locate your Notion page
          </h3>
          <p
            css={{
              width: `100%`,
              padding: `0.5rem 0`,
            }}
          >
            Preferably choose the page that has many children, because you want
            to see a knowledge graph of some extent.
          </p>
          <img src={Guide0Image} alt="Locate your Notion page" width="70%" />
        </article>
      </section>
    </main>
  );
})();
