import { requireDb, isDbConfigured } from "@/db";
import { dailyTasks } from "@/db/schema";
import { verifyToken, extractTokenFromCookies } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

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
  const day = searchParams.get("day");
  const dayNum = day ? parseInt(day, 10) : null;

  try {
    const db = requireDb();
    const conditions = [eq(dailyTasks.userId, userId)];
    if (dayNum !== null && !isNaN(dayNum)) conditions.push(eq(dailyTasks.dayNumber, dayNum));
    const rows = await db.select().from(dailyTasks).where(and(...conditions)).orderBy(dailyTasks.order);
    return Response.json({ ok: true, authenticated: true, tasks: rows });
  } catch (e) {
    console.error("tasks GET error:", String(e).slice(0, 300));
    return Response.json({ ok: false, authenticated: true, error: "Vazifalarni yuklashda xatolik" }, { status: 500 });
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

  let body: { dayNumber?: number; kind?: string; title?: string; titleUz?: string; minutes?: number; order?: number; payload?: Record<string, unknown>; result?: Record<string, unknown>; xp?: number; status?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, authenticated: true, error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  if (!body.dayNumber || !body.kind || !body.title) {
    return Response.json({ ok: false, authenticated: true, error: "dayNumber, kind, title majburiy" }, { status: 400 });
  }

  try {
    const db = requireDb();
    const [row] = await db.insert(dailyTasks).values({
      userId,
      dayNumber: body.dayNumber,
      kind: body.kind,
      title: body.title,
      titleUz: body.titleUz || "",
      minutes: body.minutes || 6,
      status: body.status || "ready",
      order: body.order ?? 0,
      payload: body.payload ?? {},
      result: body.result ?? {},
      xp: body.xp ?? 0,
    }).returning();
    return Response.json({ ok: true, authenticated: true, task: row });
  } catch (e) {
    console.error("tasks POST error:", String(e).slice(0, 300));
    return Response.json({ ok: false, authenticated: true, error: "Vazifani saqlashda xatolik" }, { status: 500 });
  }
}