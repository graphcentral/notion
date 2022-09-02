import { PostGraphsMiddleare } from "./types";

/**
 * @param notionPageUrl https://blahblah.notion.site/Some-long-title-like-this-3c718fc5c0c84a92855df8e6edca2cb5
 * @returns 3c718fc5c0c84a92855df8e6edca2cb5
 */
export function transformNotionPageUrlToIdHelper(
  notionPageUrl: string
): string {
  const trimmedUrl = notionPageUrl.trim();

  return trimmedUrl.slice(-32);
}

/**
 * notionPageUrl must have been validated when this middleware is called
 * @param req
 * @param res
 * @param next
 */
export const transformNotionPageUrlToId: PostGraphsMiddleare = (
  req,
  res,
  next
) => {
  const notionPageUrl = res.locals.jsonBody?.notionPageUrl;

  if (!notionPageUrl) {
    return res
      .status(500)
      .json({ message: `notionPageUrl is undefined or null` });
  }
  res.locals.notionPageId = transformNotionPageUrlToIdHelper(notionPageUrl);
  next();
};
