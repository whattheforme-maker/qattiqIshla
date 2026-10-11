import { requireDb } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword, signToken, getCookieName } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return Response.json({ error: "Email + parol" }, { status: 400 });
    const clean = email.trim().toLowerCase();
    let rows;
    try {
      rows = await requireDb().select().from(users).where(eq(users.email, clean)).limit(1);
    } catch (dbErr) {
      console.log("login db fallback (mock rejim):", dbErr);
      return Response.json(
        { error: "Baza ulanmagan (mock rejim). Iltimos, Ro'yxatdan o'ting yoki Demo kunni ko'ring." },
        { status: 503 }
      );
    }
    if (rows.length === 0) return Response.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    const ok = await verifyPassword(password, rows[0].passwordHash);
    if (!ok) return Response.json({ error: "Parol noto'g'ri" }, { status: 401 });
    const token = signToken({ id: rows[0].id, email: rows[0].email, name: rows[0].name });
    const res = Response.json({ ok: true, name: rows[0].name });
    res.headers.set("Set-Cookie", `${getCookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 86400}`);
    return res;
  } catch (e) {
    console.log(e);
    return Response.json({ error: "Server xatosi" }, { status: 500 });
  }
}
