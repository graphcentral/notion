import * as dotenv from "dotenv";
import path from "path";

const dotEnvPath =
  process.env.IS_SERVERLESS === `1`
    ? path.resolve(__dirname, `..`, `..`, `..`, `.env`)
    : path.resolve(__dirname, `..`, `..`, `.env`);
dotenv.config({ path: dotEnvPath });

export const ENV = {
  PUSHER_APP_ID: process.env.pusher_app_id as string,
  PUSHER_KEY: process.env.pusher_key as string,
  PUSHER_SECRET: process.env.pusher_secret as string,
  PUSHER_CLUSTER: process.env.pusher_cluster as string,
  MONGODB_URL: process.env.mongodb_url as string,
};

const maybeUndefinedEnvVals = Object.entries(ENV).filter(
  ([, val]) => val === undefined || val === null
);
if (maybeUndefinedEnvVals.length > 0) {
  throw new Error(
    `There are undefined environment variables: ${JSON.stringify(
      maybeUndefinedEnvVals
    )}`
  );
}
