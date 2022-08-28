import React, { useCallback, useEffect, useState } from "react";
import { useTypedTheme } from "src/theme";
import { enhance } from "src/utilities/essentials";
/** @jsx jsx */
import { jsx } from "@emotion/react";
import { CONSTANTS } from "src/constants";
import { isValidNotionURL } from "src/utilities/notion";

export const NotionPublicPageLinkInput = enhance(() => {
  const theme = useTypedTheme();
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

  return (
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
  );
})();
