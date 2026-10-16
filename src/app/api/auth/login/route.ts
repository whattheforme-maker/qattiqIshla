import { requireDb, isDbConfigured } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword, signToken, cookieOptions, getCookieName } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return Response.json({ error: "Email va parolni kiriting" }, { status: 400 });
  }

  const clean = body.email.trim().toLowerCase();

  if (!isDbConfigured()) {
    return Response.json(
      { error: "Baza sozlanmagan — kirish mumkin emas. Iltimos, keyinroq urinib ko'ring.", db: false },
      { status: 503 },
    );
  }

  try {
    const rows = await requireDb().select().from(users).where(eq(users.email, clean)).limit(1);
    if (rows.length === 0) {
      // Generic message to prevent email enumeration
      return Response.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 });
    }

    const ok = await verifyPassword(body.password, rows[0].passwordHash);
    if (!ok) {
      return Response.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 });
    }

    const token = signToken({ id: rows[0].id, email: rows[0].email, name: rows[0].name });
    const res = Response.json({ ok: true, name: rows[0].name, email: rows[0].email });
    res.headers.set("Set-Cookie", `${getCookieName()}=${token}; ${cookieOptions(30 * 86400)}`);
    return res;
  } catch (e) {
    console.error("login db error:", String(e).slice(0, 300));
    if ((e as { code?: string }).code === "DB_NOT_CONFIGURED") {
      return Response.json({ error: "Baza sozlanmagan — kirish mumkin emas", db: false }, { status: 503 });
    }
    return Response.json({ error: "Kirishda xatoya yuz berdi", db: false }, { status: 500 });
  }
}
