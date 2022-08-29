import * as dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, `..`, `..`, `.env`) });

export const ENV = {
  PUSHER_APP_ID: process.env.pusher_app_id as string,
  PUSHER_KEY: process.env.pusher_key as string,
  PUSHER_SECRET: process.env.pusher_secret as string,
  PUSHER_CLUSTER: process.env.pusher_cluster as string,
};

const maybeUndefinedEnvVals = Object.entries(ENV).filter(
  ([, val]) => val === undefined
);
if (maybeUndefinedEnvVals.length > 0) {
  throw new Error(
    `There is an undefined environment variable: ${JSON.stringify(
      maybeUndefinedEnvVals
    )}`
  );
}
