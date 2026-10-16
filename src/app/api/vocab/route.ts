import { requireDb, isDbConfigured } from "@/db";
import { vocabCards } from "@/db/schema";
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
    const rows = await db.select().from(vocabCards).where(eq(vocabCards.userId, userId)).orderBy(vocabCards.createdAt);
    const byWord: Record<string, typeof rows[0] & { next: string }> = {};
    for (const r of rows) {
      const next = typeof r.nextReview === "string" ? r.nextReview.slice(0, 10) : new Date(r.nextReview).toISOString().slice(0, 10);
      byWord[r.word] = { ...r, next };
    }
    return Response.json({ ok: true, authenticated: true, cards: byWord });
  } catch (e) {
    console.error("vocab GET error:", String(e).slice(0, 300));
    return Response.json({ ok: false, authenticated: true, error: "Kartalarni yuklashda xatolik" }, { status: 500 });
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

  let body: { word?: string; translation?: string; example?: string; exampleUz?: string; ef?: number; interval?: number; reps?: number; lapses?: number; nextReview?: string; lastQuality?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, authenticated: true, error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  if (!body.word || !body.translation) {
    return Response.json({ ok: false, authenticated: true, error: "word va translation majburiy" }, { status: 400 });
  }

  try {
    const db = requireDb();
    const [row] = await db.insert(vocabCards).values({
      userId,
      word: body.word,
      translation: body.translation,
      example: body.example || "",
      exampleUz: body.exampleUz || "",
      ef: body.ef ?? 2.5,
      interval: body.interval ?? 0,
      reps: body.reps ?? 0,
      lapses: body.lapses ?? 0,
      nextReview: body.nextReview || new Date().toISOString().slice(0, 10),
      lastQuality: body.lastQuality ?? 0,
    }).returning();
    return Response.json({ ok: true, authenticated: true, card: row });
  } catch (e) {
    console.error("vocab POST error:", String(e).slice(0, 300));
    return Response.json({ ok: false, authenticated: true, error: "Kartani saqlashda xatolik" }, { status: 500 });
  }
}