import { isDbConfigured, requireDb } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDbConfigured()) {
    return Response.json({ ok: true, mocked: true, db: false });
  }
  try {
    await requireDb().execute(sql`select 1`);
    return Response.json({ ok: true, db: true });
  } catch {
    return Response.json({ ok: true, mocked: true, db: false });
  }
}
