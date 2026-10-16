import { requireDb, isDbConfigured } from "@/db";
import { activities } from "@/db/schema";
import { verifyToken, extractTokenFromCookies } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

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

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    const db = requireDb();
    const rows = await db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.createdAt)).limit(limit);
    return Response.json({ ok: true, authenticated: true, activities: rows });
  } catch (e) {
    console.error("activities GET error:", String(e).slice(0, 300));
    return Response.json({ ok: false, authenticated: true, error: "Aktivitatalarni yuklashda xatolik" }, { status: 500 });
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

  let body: { kind?: string; xp?: number; meta?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, authenticated: true, error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  if (!body.kind) {
    return Response.json({ ok: false, authenticated: true, error: "kind majburiy" }, { status: 400 });
  }

  try {
    const db = requireDb();
    const [row] = await db.insert(activities).values({
      userId,
      kind: body.kind,
      xp: body.xp ?? 0,
      meta: body.meta ?? {},
    }).returning();
    return Response.json({ ok: true, authenticated: true, activity: row });
  } catch (e) {
    console.error("activities POST error:", String(e).slice(0, 300));
    return Response.json({ ok: false, authenticated: true, error: "Aktivitani saqlashda xatolik" }, { status: 500 });
  }
}