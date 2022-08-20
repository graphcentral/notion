import React, { FC, useCallback, useEffect, useState } from "react";
import { useTypedTheme } from "src/theme";
import { enhance } from "src/utilities/essentials";
/** @jsx jsx */
import { jsx, css } from "@emotion/react";
import { CONSTANTS } from "src/constants";
import { isValidNotionURL } from "src/utilities/notion";
import { useNotionLink } from "src/pages/Main";

export type NotionPublicPageLinkInputProps = {
  onClickTroubleShooting: VoidFunction;
} & ReturnType<typeof useNotionLink>;

export const NotionPublicPageLinkInput: FC<NotionPublicPageLinkInputProps> =
  enhance<NotionPublicPageLinkInputProps>(
    ({
      onClickTroubleShooting,
      isNotionPublicPageLinkValid,
      notionPublicPageLink,
      onNotionPublicPageLinkChange,
    }) => {
      const theme = useTypedTheme();

      return (
        <div
          css={{
            width: `80%`,
          }}
        >
          <input
            css={{
              width: `100%`,
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
          <p
            css={{
              position: `relative`,
              visibility: isNotionPublicPageLinkValid ? `hidden` : `visible`,
              marginTop: `0.5rem`,
              color: theme.colors.whitePrimary,
            }}
          >
            Not a valid Notion URL.{` `}
            <a
              onClick={onClickTroubleShooting}
              css={{
                color: theme.colors.whiteSecondary,
                textDecorationLine: `underline`,
                textDecorationColor: theme.lines.link,
                cursor: `pointer`,
              }}
            >
              Check troubleshooting below?
            </a>
          </p>
        </div>
      );
    }
  )();
