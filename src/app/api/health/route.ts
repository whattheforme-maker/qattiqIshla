import { isDbConfigured, requireDb, dbStatus } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const st = dbStatus();
  if (!isDbConfigured()) {
    return Response.json({
      ok: false,
      mocked: true,
      db: false,
      message: "DATABASE_URL sozlanmagan — faqat demo rejim",
      hint: "Hosting boshqaruv paneli da DATABASE_URL o'rnating",
    }, { status: 503 });
  }
  try {
    await requireDb().execute(sql`select 1`);
    return Response.json({ ok: true, db: true, ...st, message: "Baza ulanishi faol" });
  } catch (e) {
    return Response.json({
      ok: false,
      mocked: false,
      db: false,
      configured: true,
      message: "DATABASE_URL bor lekin ulanib bo'lmadi",
      hint: "drizzle-kit push yoki migrate.sql orqali jadvallarni yarating",
    }, { status: 503 });
  }
}
