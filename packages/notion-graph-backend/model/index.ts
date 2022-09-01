import to from "await-to-js";
import mongoose from "mongoose";
import { ENV } from "../env";

export let connectErr: Error | null | undefined = undefined;

(async () => {
  const [mongoClientConnectErr] = await to(mongoose.connect(ENV.MONGODB_URL));
  connectErr = mongoClientConnectErr;
})();

export function waitUntilMongoClientConnected(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (connectErr) reject(connectErr);
    else if (connectErr === null) resolve();
    mongoose.connection.once(`open`, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}
