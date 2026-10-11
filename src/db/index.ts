import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function getPool(): Pool | null {
  if (!databaseUrl) return null;
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    const isLocal = databaseUrl.includes("127.0.0.1") || databaseUrl.includes("localhost");
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: databaseUrl,
      // Neon/Supabase kabi cloud bazalar SSL talab qiladi. Local da o'chirilgan.
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
      max: 1, // serverless (Vercel) da ko'p connection ochmaslik uchun
      idleTimeoutMillis: 20000,
      connectionTimeoutMillis: 10000,
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

// Vercel logida aniq ko'rish uchun
export function dbStatus(): { configured: boolean; host: string } {
  if (!databaseUrl) return { configured: false, host: "none" };
  try {
    const u = new URL(databaseUrl);
    return { configured: true, host: u.host };
  } catch {
    return { configured: true, host: "unknown" };
  }
}

