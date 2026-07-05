import { Pool } from "pg";
import { dbConfig } from "@/server/config/db";

declare global {
  var __novaPulsePgPool: Pool | undefined;
}

export const pool =
  global.__novaPulsePgPool ??
  new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });

if (process.env.NODE_ENV !== "production") {
  global.__novaPulsePgPool = pool;
}
