import { PrismaClient } from "@prisma/client";

declare global {
  var __db: PrismaClient | undefined;
}

function getDb(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return new PrismaClient();
  }

  if (!global.__db) {
    global.__db = new PrismaClient();
  }

  return global.__db;
}

const db = getDb();

export { db };
