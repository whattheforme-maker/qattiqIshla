import { requireDb, isDbConfigured } from "@/db";
import { placements } from "@/db/schema";
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

  try {
    const db = requireDb();
    const rows = await db.select().from(placements).where(eq(placements.userId, userId)).orderBy(desc(placements.createdAt));
    return Response.json({ ok: true, authenticated: true, placements: rows });
  } catch (e) {
    console.error("placement GET error:", String(e).slice(0, 300));
    return Response.json({ ok: false, authenticated: true, error: "Test natijalarini yuklashda xatolik" }, { status: 500 });
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

  let body: { score?: number; level?: string; weakAreas?: string[]; writingText?: string; writingScore?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, authenticated: true, error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  try {
    const db = requireDb();
    const [row] = await db.insert(placements).values({
      userId,
      score: body.score ?? 0,
      level: body.level || "A1",
      weakAreas: body.weakAreas ?? [],
      writingText: body.writingText || "",
      writingScore: body.writingScore ?? 0,
    }).returning();
    return Response.json({ ok: true, authenticated: true, placement: row });
  } catch (e) {
    console.error("placement POST error:", String(e).slice(0, 300));
    return Response.json({ ok: false, authenticated: true, error: "Test natijasini saqlashda xatolik" }, { status: 500 });
  }
}