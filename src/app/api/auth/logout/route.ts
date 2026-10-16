import { getCookieName, cookieOptions } from "@/lib/auth";

export async function POST() {
  const res = Response.json({ ok: true, message: "Chiqildi" });
  // Clear the session cookie by setting Max-Age=0 with same attributes
  res.headers.set(
    "Set-Cookie",
    `${getCookieName()}=; Path=/; HttpOnly; Max-Age=0`,
  );
  return res;
}

export async function GET() {
  return Response.json({ ok: true, message: "Logout endpoint — POST ni ishlating" });
}
