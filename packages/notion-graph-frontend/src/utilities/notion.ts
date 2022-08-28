export const NORMAL_USERS_NOTION_URL_REGEX =
  /^(https:\/\/)?([-a-zA-Z0-9]+\.)?notion\.site\/[-a-zA-Z0-9]*-[a-zA-Z0-9]{32}$/;
export const OFFICIAL_NOTION_URL_REGEX =
  /^(https:\/\/)?(www\.)?notion\.so\/[-a-zA-Z0-9]*-[a-zA-Z0-9]{32}$/;

/**
 *
 * @param url should be in the form of https://blahblah.notion.site/Some-long-title-like-this-3c718fc5c0c84a92855df8e6edca2cb5 or
 * https://notion.so/Some-long-title-like-this-3c718fc5c0c84a92855df8e6edca2cb5.
 * These are only two types of valid URLs (but with the exclusion/inclusion of https://, www, and so on)
 * @returns whether the url is in the specified form
 */
export function isValidNotionURL(url: string): boolean {
  return (
    NORMAL_USERS_NOTION_URL_REGEX.test(url) ||
    OFFICIAL_NOTION_URL_REGEX.test(url)
  );
}
