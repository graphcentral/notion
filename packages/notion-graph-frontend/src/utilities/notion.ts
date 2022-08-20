const NORMAL_USERS_NOTION_URL_REGEX =
  /^(https:\/\/)?[-a-zA-Z0-9]*\.notion\.site\/[-a-zA-Z0-9]*-[a-zA-Z0-9]{32}$/g;
const OFFICIAL_NOTION_URL_REGEX =
  /^(https:\/\/)?(www\.)?notion\.so\/[-a-zA-Z0-9]*-[a-zA-Z0-9]{32}$/g;

/**
 *
 * @param url should be in the form of https://blahblah.notion.site/Some-long-title-like-this-3c718fc5c0c84a92855df8e6edca2cb5
 * @returns whether the url is in the specified form
 */
export function isValidNotionURL(url: string): boolean {
  return (
    NORMAL_USERS_NOTION_URL_REGEX.test(url) ||
    OFFICIAL_NOTION_URL_REGEX.test(url)
  );
}
