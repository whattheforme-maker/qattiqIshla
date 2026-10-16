import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __linguaPlanPostgresPool?: Pool;
  __linguaPlanTablesInitialized?: boolean;
};

function getPool(): Pool | null {
  if (!databaseUrl) return null;
  if (!globalForDb.__linguaPlanPostgresPool) {
    const isLocal =
      databaseUrl.includes("127.0.0.1") || databaseUrl.includes("localhost");
    globalForDb.__linguaPlanPostgresPool = new Pool({
      connectionString: databaseUrl,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return globalForDb.__linguaPlanPostgresPool;
}

export const pool = getPool();

// db is null when DATABASE_URL is not set — local/demo mode only.
// Authenticated APIs must check db !== null before writing.
export const db: ReturnType<typeof drizzle> | null = pool
  ? drizzle(pool)
  : null;

export function requireDb() {
  if (!db) {
    const err = new Error(
      "DATABASE_URL is not configured — persistent account operations unavailable",
    );
    (err as { code?: string }).code = "DB_NOT_CONFIGURED";
    throw err;
  }
  return db;
}

export function isDbConfigured() {
  return !!databaseUrl && !!pool;
}

export function dbStatus(): { configured: boolean; host: string } {
  if (!databaseUrl) return { configured: false, host: "none" };
  try {
    const u = new URL(databaseUrl);
    return { configured: true, host: u.host };
  } catch {
    return { configured: true, host: "unknown" };
  }
}

// One-time table initialization. Call explicitly, NOT on every request.
let initPromise: Promise<void> | null = null;

export async function ensureTablesExist(): Promise<void> {
  if (!db) return;
  if (initPromise) return initPromise;
  if (globalForDb.__linguaPlanTablesInitialized) return;

  initPromise = (async () => {
    try {
      await db.execute(sql`
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        CREATE TABLE IF NOT EXISTS users (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name text NOT NULL,
          email text NOT NULL UNIQUE,
          password_hash text NOT NULL,
          avatar text NOT NULL DEFAULT 'M',
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS profiles (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          current_level text NOT NULL DEFAULT 'A1',
          target_level text NOT NULL DEFAULT 'B2',
          deadline_days integer NOT NULL DEFAULT 90,
          daily_minutes integer NOT NULL DEFAULT 25,
          days_per_week integer NOT NULL DEFAULT 5,
          purpose text NOT NULL DEFAULT 'ish',
          interests jsonb NOT NULL DEFAULT '[]',
          weak_areas jsonb NOT NULL DEFAULT '[]',
          streak_days integer NOT NULL DEFAULT 0,
          longest_streak integer NOT NULL DEFAULT 0,
          freeze_available integer NOT NULL DEFAULT 1,
          last_active_date date,
          total_xp integer NOT NULL DEFAULT 0,
          completed_count integer NOT NULL DEFAULT 0,
          start_date date,
          updated_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS placements (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          score integer NOT NULL DEFAULT 0,
          level text NOT NULL DEFAULT 'A1',
          weak_areas jsonb NOT NULL DEFAULT '[]',
          writing_text text DEFAULT '',
          writing_score integer DEFAULT 0,
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS plans (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          total_days integer NOT NULL DEFAULT 90,
          start_date date NOT NULL,
          weeks jsonb NOT NULL DEFAULT '[]',
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS daily_tasks (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          day_number integer NOT NULL,
          kind text NOT NULL,
          title text NOT NULL,
          title_uz text NOT NULL DEFAULT '',
          minutes integer NOT NULL DEFAULT 6,
          status text NOT NULL DEFAULT 'ready',
          "order" integer NOT NULL DEFAULT 0,
          payload jsonb NOT NULL DEFAULT '{}',
          result jsonb NOT NULL DEFAULT '{}',
          xp integer NOT NULL DEFAULT 0,
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS vocab_cards (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          word text NOT NULL,
          translation text NOT NULL,
          example text NOT NULL DEFAULT '',
          example_uz text NOT NULL DEFAULT '',
          ef double precision NOT NULL DEFAULT 2.5,
          interval integer NOT NULL DEFAULT 0,
          reps integer NOT NULL DEFAULT 0,
          lapses integer NOT NULL DEFAULT 0,
          next_review date NOT NULL,
          last_quality integer DEFAULT 0,
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS activities (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          kind text NOT NULL,
          xp integer NOT NULL DEFAULT 0,
          meta jsonb NOT NULL DEFAULT '{}',
          created_at timestamp NOT NULL DEFAULT now()
        );
      `);
      globalForDb.__linguaPlanTablesInitialized = true;
    } catch (err) {
      console.error("ensureTablesExist error:", err);
      throw err;
    }
  })();
  return initPromise;
}


