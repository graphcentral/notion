import {
  NORMAL_USERS_NOTION_URL_REGEX,
  OFFICIAL_NOTION_URL_REGEX,
} from "src/utilities/notion";

describe(`NORMAL_USERS_NOTION_URL_REGEX`, () => {
  it.concurrent.each([
    [
      `https://aaa.notion.site/blah-blah-blah-12345678901234567890123456789012`,
      true,
    ],
    [
      `https://.notion.site/blah-blah-blah-12345678901234567890123456789012`,
      false,
    ],
    [
      `https:/aaa.notion.site/blah-blah-blah-12345678901234567890123456789012`,
      false,
    ],
    [
      `httpsaaa.notion.site/blah-blah-blah-12345678901234567890123456789012`,
      true,
    ],
    [`.notion.site/blah-blah-blah-12345678901234567890123456789012`, false],
    [
      `blah.notion.site/blah-blah-blah-1234567890123456789012345678901234567`,
      false,
    ],
    [
      `blah.notion.site/asdfasfasdfasfasdfasdfasdf-asdfasdfadf-1234567890123456789012345678901234567`,
      false,
    ],
    [
      `blah.notion.so/asdfasfasdfasfasdfasdfasdf-asdfasdfadf-1234567890123456789012345678901234567`,
      false,
    ],
    [
      `blah.notion.site/asdfasfasdfasfasdfasdfasdf-asdfasdfadf-12345678901234567890123456789012`,
      true,
    ],
  ])(`%p should be a %p normal user's notion url`, (url, expected) => {
    expect(NORMAL_USERS_NOTION_URL_REGEX.test(url)).toBe(expected);
  });
});
describe(`OFFICIAL_NOTION_URL_REGEX`, () => {
  it.concurrent.each([
    [`https://notion.so/blah-blah-blah-12345678901234567890123456789012`, true],
    [`notion.so/blah-blah-blah-12345678901234567890123456789012`, true],
    [`www.notion.so/blah-blah-blah-12345678901234567890123456789012`, true],
    [
      `www.notion.so/blah-blah-blahaaaaa-12345678901234567890123456789012`,
      true,
    ],
    [`.notion.so/blah-blah-blahaaaaa-12345678901234567890123456789012`, false],
    [`..notion.so/blah-blah-blahaaaaa-12345678901234567890123456789012`, false],
    [
      `//..notion.so/blah-blah-blahaaaaa-12345678901234567890123456789012`,
      false,
    ],
    [
      `https://..notion.so/blah-blah-blahaaaaa-12345678901234567890123456789012`,
      false,
    ],
    [
      `https://.notion.so/blah-blah-blahaaaaa-12345678901234567890123456789012`,
      false,
    ],
    [
      `https://ww.notion.so/blah-blah-blahaaaaa-12345678901234567890123456789012`,
      false,
    ],
    [
      `https://notion.so/blah-blah-blahaaaaa-1234567890123456789012345678901a`,
      true,
    ],
  ])(`%p should be a %p official notion url`, (url, expected) => {
    expect(OFFICIAL_NOTION_URL_REGEX.test(url)).toBe(expected);
  });
});
