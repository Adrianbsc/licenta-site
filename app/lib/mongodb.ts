import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI?.trim();
const MONGODB_DB = process.env.MONGODB_DB?.trim() || "cata-stoma";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalThis.mongooseCache = cache;

export function shouldUseMongo() {
  return Boolean(MONGODB_URI);
}

export async function getMongoDb() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!cache.conn) {
    cache.promise ??= mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
      bufferCommands: false,
    });
    cache.conn = await cache.promise;
  }

  const db = cache.conn.connection.db;

  if (!db) {
    throw new Error("MongoDB connection is not ready.");
  }

  return db;
}
