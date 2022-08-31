import { MongoClient, ServerApiVersion } from "mongodb";
import { ENV } from "../env";

export const mongoClient = new MongoClient(ENV.MONGODB_URL, {
  serverApi: ServerApiVersion.v1,
});
