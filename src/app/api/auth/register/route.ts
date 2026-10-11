import { requireDb } from "@/db";
import { users, profiles } from "@/db/schema";
import { hashPassword, signToken, getCookieName } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) return Response.json({ error: "To'liq kiriting" }, { status: 400 });
    if (password.length < 6) return Response.json({ error: "Parol kamida 6 belgi" }, { status: 400 });
    const clean = email.trim().toLowerCase();
    try {
      const db = requireDb();
      const existing = await db.select().from(users).where(eq(users.email, clean)).limit(1);
      if (existing.length > 0) return Response.json({ error: "Bu email band" }, { status: 409 });
      const hash = await hashPassword(password);
      const inserted = await db.insert(users).values({ name: name.trim(), email: clean, passwordHash: hash, avatar: name.trim()[0]?.toUpperCase() || "M" }).returning();
      const u = inserted[0];
      await db.insert(profiles).values({ userId: u.id }).onConflictDoNothing();
      const token = signToken({ id: u.id, email: u.email, name: u.name });
      const res = Response.json({ ok: true, name: u.name });
      res.headers.set("Set-Cookie", `${getCookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 86400}`);
      return res;
    } catch (dbErr) {
      console.log("register db fallback", dbErr);
      const msg = String(dbErr).slice(0, 300);
      // Foydalanuvchiga aniq sabab: Vercel log + ekranda ko'rinadi
      if (String(dbErr).includes("DATABASE_URL is not set")) {
        return Response.json({ error: "Baza sozlanmagan: Vercel da DATABASE_URL yo'q", mocked: true }, { status: 503 });
      }
      return Response.json({ error: `Baza xatosi: ${msg}`, mocked: true }, { status: 503 });
    }
  } catch {
    return Response.json({ error: "Server xatosi" }, { status: 500 });
  }
}
