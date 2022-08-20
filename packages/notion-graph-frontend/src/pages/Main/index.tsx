import React, { useCallback, useEffect, useRef, useState } from "react";
import { enhance } from "src/utilities/essentials";
import { useTypedTheme } from "src/theme";
/** @jsx jsx */
import { jsx } from "@emotion/react";
import { HowToAndTroubleShooting } from "src/pages/Main/localFragments/HowToAndTroubleShooting";
import { NotionPublicPageLinkInput } from "src/pages/Main/localFragments/NotionPublicPageLinkInput";
import { CONSTANTS } from "src/constants";
import { isValidNotionURL } from "src/utilities/notion";

export function useNotionLink() {
  const [notionPublicPageLink, setNotionPublicPageLink] = useState(
    CONSTANTS.NOTION_HELP_PAGE
  );
  const [isNotionPublicPageLinkValid, setNotionPagePublicLinkValid] = useState(
    isValidNotionURL(CONSTANTS.NOTION_HELP_PAGE)
  );
  const onNotionPublicPageLinkChange: NonNullable<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >[`onChange`]
  > = useCallback((event) => {
    console.log(
      event,
      event.target.value,
      isValidNotionURL(event.target.value)
    );
    setNotionPublicPageLink(event.target.value);
  }, []);

  useEffect(() => {
    setNotionPagePublicLinkValid(isValidNotionURL(notionPublicPageLink));
  }, [notionPublicPageLink]);

  return {
    isNotionPublicPageLinkValid,
    onNotionPublicPageLinkChange,
    notionPublicPageLink,
  };
}

export const MainPage = enhance(() => {
  const theme = useTypedTheme();

  const troubleShootingSectionRef = useRef<HTMLElement | null>(null);
  const onClickProblems = useCallback(() => {
    if (!troubleShootingSectionRef.current) return;

    troubleShootingSectionRef.current.scrollIntoView({
      behavior: `smooth`,
    });
  }, []);
  const {
    isNotionPublicPageLinkValid,
    onNotionPublicPageLinkChange,
    notionPublicPageLink,
  } = useNotionLink();

  return (
    <main
      css={{
        backgroundColor: theme.colors.darkSecondary,
        width: `100%`,
        height: `max-content`,
        display: `flex`,
        justifyContent: `center`,
        alignItems: `center`,
        flexDirection: `column`,
      }}
    >
      <section
        css={{
          width: `100%`,
          minHeight: `100vh`,
          height: `100vh`,
          maxHeight: `100vh`,
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
        <NotionPublicPageLinkInput
          onClickTroubleShooting={onClickProblems}
          {...{
            isNotionPublicPageLinkValid,
            onNotionPublicPageLinkChange,
            notionPublicPageLink,
          }}
        />
        <button
          disabled={!isNotionPublicPageLinkValid}
          css={{
            background: theme.colors.interactivePrimary,
            color: theme.colors.interactiveText,
            border: `none`,
            borderRadius: theme.border.smallRadius,
            padding: `1rem`,
            marginTop: `1rem`,
            marginBottom: `auto`,
            cursor: isNotionPublicPageLinkValid ? `pointer` : `not-allowed`,
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
        <HowToAndTroubleShooting />
      </section>
    </main>
  );
})();
