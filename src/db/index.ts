import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function getPool(): Pool | null {
  if (!databaseUrl) return null;
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: databaseUrl,
    });
  }
  return globalForDb.__arenaNextJsPostgresqlPool;
}

export const pool = getPool();

// DB bo'lmasa ham loyiha ishga tushsin (local-first / mock rejim).
// db null bo'lsa API route'lar try/catch orqali mocked javob qaytaradi.
export const db: ReturnType<typeof drizzle> | null = pool ? drizzle(pool) : null;

export function requireDb() {
  if (!db) throw new Error("DATABASE_URL is not set — mock rejim");
  return db;
}

export function isDbConfigured() {
  return !!databaseUrl && !!pool;
}

