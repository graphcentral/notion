import to from "await-to-js";
import { IsUrl, validateOrReject } from "class-validator";
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from "class-validator";
import { RequestHandler } from "express";
import { transformNotionPageUrlToIdHelper } from "./transformer";
import { GetGraphsMiddleare, PostGraphsMiddleare } from "./types";

export const NORMAL_USERS_NOTION_URL_REGEX =
  /^(https:\/\/)?([-a-zA-Z0-9]+\.)?notion\.site\/[-a-zA-Z0-9]*-[a-zA-Z0-9]{32}$/;
export const OFFICIAL_NOTION_URL_REGEX =
  /^(https:\/\/)?(www\.)?notion\.so\/[-a-zA-Z0-9]*-[a-zA-Z0-9]{32}$/;

@ValidatorConstraint({ name: `notionUrl`, async: false })
export class NotionUrl implements ValidatorConstraintInterface {
  validate(url: string) {
    return (
      NORMAL_USERS_NOTION_URL_REGEX.test(url) ||
      OFFICIAL_NOTION_URL_REGEX.test(url)
    );
  }

  defaultMessage() {
    return `Url "($value)" is not in the valid form of Notion URL`;
  }
}

export function IsNotionUrl(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: NotionUrl,
    });
  };
}

export class NotionGraphInfo {
  @IsUrl({
    protocols: [`https`],
    host_whitelist: [
      // for official Notion pages
      `notion.so`,
      `www.notion.so`,
      // for user-created Notion pages
      `notion.site`,
      `www.notion.site`,
    ],
  })
  @IsNotionUrl()
  notionPageUrl: string;

  constructor({ notionPageUrl }: { notionPageUrl: string }) {
    this.notionPageUrl = notionPageUrl;
  }
}

export const validateNotionGraphInfo: PostGraphsMiddleare = async (
  req,
  res,
  next
) => {
  const jsonBody: NotionGraphInfo = new NotionGraphInfo(req.body);
  const [validateErr] = await to(validateOrReject(jsonBody));
  if (validateErr) {
    console.log(validateErr);
    return res.status(422).json({ message: validateErr.message });
  }
  res.locals.jsonBody = jsonBody;
  next();
};

export const validateGetGraphQuery: GetGraphsMiddleare = async (
  req,
  res,
  next
) => {
  const { notion_page_url: notionPageUrl } = req.query;
  const notionGraphInfo: NotionGraphInfo = new NotionGraphInfo({
    notionPageUrl,
  });
  const [validateErr] = await to(validateOrReject(notionGraphInfo));
  if (validateErr) {
    console.log(validateErr);
    return res.status(422).json({ message: validateErr.message });
  }
  res.locals.notionPageId = transformNotionPageUrlToIdHelper(
    notionGraphInfo.notionPageUrl
  );
  next();
};
