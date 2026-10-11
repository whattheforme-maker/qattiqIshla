import { requireDb } from "@/db";
import { profiles, users } from "@/db/schema";
import { verifyToken, getCookieName } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookie = req.headers.get("cookie") || "";
    const m = cookie.match(new RegExp(`${getCookieName()}=([^;]+)`));
    if (!m) return Response.json({ ok: true, mocked: true });
    const sess = verifyToken(decodeURIComponent(m[1]));
    if (!sess) return Response.json({ ok: true, mocked: true });
    try {
      const db = requireDb();
      const rows = await db.select().from(users).where(eq(users.id, sess.id)).limit(1);
      if (rows.length === 0) return Response.json({ ok: true, mocked: true });
      await db
        .insert(profiles)
        .values({
          userId: sess.id,
          currentLevel: body.currentLevel || "A1",
          targetLevel: body.targetLevel || "B2",
          deadlineDays: body.deadlineDays || 90,
          dailyMinutes: body.dailyMinutes || 25,
          daysPerWeek: body.daysPerWeek || 5,
          purpose: body.purpose || "ish",
          interests: body.interests || [],
          weakAreas: body.weakAreas || [],
          totalXp: body.totalXp || 0,
          streakDays: body.streakDays || 0,
        })
        .onConflictDoUpdate({
          target: profiles.userId,
          set: {
            currentLevel: body.currentLevel || "A1",
            targetLevel: body.targetLevel || "B2",
            deadlineDays: body.deadlineDays || 90,
            dailyMinutes: body.dailyMinutes || 25,
            daysPerWeek: body.daysPerWeek || 5,
            purpose: body.purpose || "ish",
            interests: body.interests || [],
            weakAreas: body.weakAreas || [],
          },
        });
    } catch (e) {
      console.log("profile fallback", e);
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: true, mocked: true });
  }
}
