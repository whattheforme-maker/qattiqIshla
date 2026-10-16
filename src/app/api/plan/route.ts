import { requireDb, isDbConfigured } from "@/db";
import { plans } from "@/db/schema";
import { verifyToken, extractTokenFromCookies } from "@/lib/auth";
import { eq } from "drizzle-orm";

function getUserIdFromReq(req: Request): string | null {
  const token = extractTokenFromCookies(req.headers.get("cookie") || "");
  if (!token) return null;
  const sess = verifyToken(token);
  return sess ? sess.id : null;
}

export async function GET(req: Request) {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return Response.json({ ok: false, authenticated: false, error: "Autentifikatsiya talab qilinadi" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return Response.json({ ok: false, authenticated: true, db: false, error: "Baza sozlanmagan" }, { status: 503 });
  }

  try {
    const db = requireDb();
    const rows = await db.select().from(plans).where(eq(plans.userId, userId)).limit(1);
    return Response.json({ ok: true, authenticated: true, plan: rows.length > 0 ? rows[0] : null });
  } catch (e) {
    console.error("plan GET error:", String(e).slice(0, 300));
    return Response.json({ ok: false, authenticated: true, error: "Rejani yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return Response.json({ ok: false, authenticated: false, error: "Autentifikatsiya talab qilinadi" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return Response.json({ ok: false, authenticated: true, db: false, error: "Baza sozlanmagan" }, { status: 503 });
  }

  let body: { totalDays?: number; startDate?: string; weeks?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, authenticated: true, error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  if (!body.totalDays || !body.startDate) {
    return Response.json({ ok: false, authenticated: true, error: "totalDays va startDate majburiy" }, { status: 400 });
  }

  try {
    const db = requireDb();
    const [row] = await db.insert(plans).values({
      userId,
      totalDays: body.totalDays,
      startDate: body.startDate,
      weeks: body.weeks ?? [],
    }).onConflictDoUpdate({
      target: plans.userId,
      set: { totalDays: body.totalDays, startDate: body.startDate, weeks: body.weeks ?? [] },
    }).returning();
    return Response.json({ ok: true, authenticated: true, plan: row });
  } catch (e) {
    console.error("plan POST error:", String(e).slice(0, 300));
    return Response.json({ ok: false, authenticated: true, error: "Rejani saqlashda xatolik" }, { status: 500 });
  }
}