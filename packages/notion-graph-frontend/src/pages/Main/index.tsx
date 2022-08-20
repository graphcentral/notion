import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { enhance } from "src/utilities/essentials";
import { useTypedTheme } from "src/theme";
/** @jsx jsx */
import { jsx } from "@emotion/react";
import { CONSTANTS } from "src/constants";
import { HowToAndTroubleShooting } from "src/pages/Main/localFragments";
import { isValidNotionURL } from "src/utilities/notion";
import debounce from "lodash.debounce";

export const MainPage = enhance(() => {
  const theme = useTypedTheme();
  const [notionPublicPageLink, setNotionPublicPageLink] = useState(
    CONSTANTS.NOTION_HELP_PAGE
  );
  const [isNotionPublicPageLinkValid, setNotionPagePublicLinkValid] = useState(
    () => isValidNotionURL(CONSTANTS.NOTION_HELP_PAGE)
  );
  const onNotionPublicPageLinkChange: NonNullable<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >[`onChange`]
  > = useCallback(
    (event) => {
      console.log(
        event,
        event.target.value,
        isValidNotionURL(event.target.value)
      );
      setNotionPagePublicLinkValid(() => isValidNotionURL(event.target.value));
      setNotionPublicPageLink(event.target.value);
    },
    [setNotionPagePublicLinkValid]
  );
  const troubleShootingSectionRef = useRef<HTMLElement | null>(null);
  const onClickProblems = useCallback(() => {
    if (!troubleShootingSectionRef.current) return;

    troubleShootingSectionRef.current.scrollIntoView({
      behavior: `smooth`,
    });
  }, []);

  console.log(`compoennt: ${isNotionPublicPageLinkValid}`);
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
        <input
          css={{
            width: `80%`,
            border: isNotionPublicPageLinkValid
              ? `thin solid ${theme.colors.whiteThird}`
              : `thin solid ${theme.colors.warningSeconary}`,
            backgroundColor: isNotionPublicPageLinkValid
              ? theme.colors.darkPrimary
              : theme.colors.warningPrimary,
            color: theme.colors.whitePrimary,
            padding: `1rem`,
            fontSize: `1rem`,
            borderRadius: theme.border.smallRadius,
            "&:hover": {
              background: isNotionPublicPageLinkValid
                ? theme.colors.whiteFourth
                : theme.colors.warningPrimary,
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
        <HowToAndTroubleShooting />
      </section>
    </main>
  );
})();
