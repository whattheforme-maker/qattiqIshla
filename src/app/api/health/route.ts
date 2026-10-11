import { isDbConfigured, requireDb, dbStatus } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const st = dbStatus();
  if (!isDbConfigured()) {
    return Response.json({ ok: true, mocked: true, db: false, ...st, hint: "Vercel > Settings > Environment Variables da DATABASE_URL yo'q" });
  }
  try {
    await requireDb().execute(sql`select 1`);
    return Response.json({ ok: true, db: true, ...st });
  } catch (e) {
    return Response.json({ ok: true, mocked: true, db: false, ...st, error: String(e).slice(0, 300), hint: "DATABASE_URL bor lekin ulanib bo'lmadi yoki table yo'q — drizzle-kit push qiling" });
  }
}
