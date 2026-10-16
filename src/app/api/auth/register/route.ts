import { requireDb, isDbConfigured } from "@/db";
import { users, profiles } from "@/db/schema";
import { hashPassword, signToken, cookieOptions, getCookieName } from "@/lib/auth";
import { eq } from "drizzle-orm";

const MAX_NAME_LEN = 60;
const MAX_EMAIL_LEN = 254;
const MIN_PASSWORD = 6;
const MAX_PASSWORD = 128;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateName(name: string): string | null {
  const n = name.trim();
  if (!n || n.length < 2) return "Ismingizni kiriting (kamida 2 belgi)";
  if (n.length > MAX_NAME_LEN) return "Ism juda uzun";
  return null;
}

function validateEmail(email: string): string | null {
  const e = normalizeEmail(email);
  if (!e) return "Emailni kiriting";
  if (e.length > MAX_EMAIL_LEN) return "Email juda uzun";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(e)) return "Email noto'g'ri formatda";
  return null;
}

function validatePassword(pw: string): string | null {
  if (!pw) return "Parolni kiriting";
  if (pw.length < MIN_PASSWORD) return `Parol kamida ${MIN_PASSWORD} belgi bo'lishi kerak`;
  if (pw.length > MAX_PASSWORD) return "Parol juda uzun";
  return null;
}

export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const name = body.name;
  const email = body.email;
  const password = body.password;

  const nameErr = validateName(name ?? "");
  if (nameErr) return Response.json({ error: nameErr }, { status: 400 });

  const emailErr = validateEmail(email ?? "");
  if (emailErr) return Response.json({ error: emailErr }, { status: 400 });

  const pwErr = validatePassword(password ?? "");
  if (pwErr) return Response.json({ error: pwErr }, { status: 400 });

  const cleanName = name!.trim();
  const cleanEmail = normalizeEmail(email!);
  const cleanPassword = password!;

  if (!isDbConfigured()) {
    return Response.json(
      { error: "Baza sozlanmagan — ro'yxatdan o'tish mumkin emas. Iltimos, keyinroq urinib ko'ring.", db: false },
      { status: 503 },
    );
  }

  try {
    const db = requireDb();

    const existing = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (existing.length > 0) {
      return Response.json({ error: "Bu email bilan akkaunt allaqachon ro'yxatdan o'tgan", code: "EMAIL_EXISTS" }, { status: 409 });
    }

    const hash = await hashPassword(cleanPassword);
    const inserted = await db.insert(users)
      .values({
        name: cleanName,
        email: cleanEmail,
        passwordHash: hash,
        avatar: cleanName[0]?.toUpperCase() || "M",
      })
      .returning();
    const u = inserted[0];

    // Create initial profile in the same logical step (no transaction wrapper needed
    // for two inserts on separate tables; profile.userId FK guarantees consistency).
    await db.insert(profiles).values({
      userId: u.id,
      currentLevel: "A1",
      targetLevel: "B2",
      deadlineDays: 90,
      dailyMinutes: 25,
      daysPerWeek: 5,
      purpose: "ish",
      interests: [],
      weakAreas: [],
      streakDays: 0,
      longestStreak: 0,
      freezeAvailable: 1,
      totalXp: 0,
      completedCount: 0,
    }).onConflictDoNothing();

    const token = signToken({ id: u.id, email: u.email, name: u.name });
    const res = Response.json({ ok: true, name: u.name, email: u.email, created: true });
    res.headers.set("Set-Cookie", `${getCookieName()}=${token}; ${cookieOptions(30 * 86400)}`);
    return res;
  } catch (dbErr) {
    console.error("register db error:", String(dbErr).slice(0, 300));
    if ((dbErr as { code?: string }).code === "DB_NOT_CONFIGURED") {
      return Response.json(
        { error: "Baza sozlanmagan — ro'yxatdan o'tish mumkin emas", db: false },
        { status: 503 },
      );
    }
    // Unique violation on email (race condition)
    const msg = String(dbErr);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return Response.json({ error: "Bu email bilan akkaunt allaqachon ro'yxatdan o'tgan", code: "EMAIL_EXISTS" }, { status: 409 });
    }
    return Response.json({ error: "Ro'yxatdan o'tishda xatoya yuz berdi", db: false }, { status: 500 });
  }
}
