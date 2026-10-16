import { requireDb, isDbConfigured } from "@/db";
import { profiles, users } from "@/db/schema";
import { verifyToken, extractTokenFromCookies } from "@/lib/auth";
import { eq } from "drizzle-orm";

function getUserIdFromReq(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const token = extractTokenFromCookies(cookie);
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
    return Response.json(
      { ok: false, authenticated: true, db: false, error: "Baza sozlanmagan" },
      { status: 503 },
    );
  }

  try {
    const db = requireDb();
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userRows.length === 0) {
      return Response.json({ ok: false, authenticated: true, error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }
    const profileRows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    const profile = profileRows.length > 0 ? profileRows[0] : null;
    return Response.json({
      ok: true,
      authenticated: true,
      user: { id: userRows[0].id, name: userRows[0].name, email: userRows[0].email, avatar: userRows[0].avatar },
      profile,
    });
  } catch (e) {
    console.error("profile GET error:", String(e).slice(0, 300));
    return Response.json({ ok: false, authenticated: true, error: "Profilni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return Response.json({ ok: false, authenticated: false, error: "Autentifikatsiya talab qilinadi" }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return Response.json(
      { ok: false, authenticated: true, db: false, error: "Baza sozlanmagan — profil saqlanmaydi" },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, authenticated: true, error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  try {
    const db = requireDb();
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userRows.length === 0) {
      return Response.json({ ok: false, authenticated: true, error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "currentLevel", "targetLevel", "deadlineDays", "dailyMinutes",
      "daysPerWeek", "purpose", "interests", "weakAreas", "totalXp",
      "streakDays", "longestStreak", "freezeAvailable",
    ];
    for (const f of allowedFields) {
      if (f in body) updateData[f] = body[f];
    }
    updateData.updatedAt = new Date();

    await db
      .insert(profiles)
      .values({ userId, ...updateData } as any)
      .onConflictDoUpdate({
        target: profiles.userId,
        set: updateData as any,
      });

    return Response.json({ ok: true, authenticated: true, message: "Profil saqlandi" });
  } catch (e) {
    console.error("profile POST error:", String(e).slice(0, 300));
    return Response.json({ ok: false, authenticated: true, error: "Profilni saqlashda xatolik" }, { status: 500 });
  }
}
