import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "linguaplan_session";

// AUTH_SECRET is required. In production there must be no predictable fallback.
const SECRET = process.env.AUTH_SECRET;

if (!SECRET && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET must be set in production");
}

const FALLBACK_SECRET = "linguaplan-dev-secret-uz-2026";
const ACTIVE_SECRET = SECRET || FALLBACK_SECRET;

export function getCookieName() {
  return COOKIE_NAME;
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function cookieOptions(maxAgeSeconds: number): string {
  const secure = isProduction() ? "; Secure" : "";
  const sameSite = "; SameSite=Lax";
  return `Path=/; HttpOnly${secure}${sameSite}; Max-Age=${maxAgeSeconds}`;
}

export async function hashPassword(pw: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function signToken(payload: { id: string; email: string; name: string }) {
  return jwt.sign(payload, ACTIVE_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): { id: string; email: string; name: string } | null {
  try {
    return jwt.verify(token, ACTIVE_SECRET) as { id: string; email: string; name: string };
  } catch {
    return null;
  }
}

export function extractTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const m = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
