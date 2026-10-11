import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "linguaplan_session";
const SECRET =
  process.env.AUTH_SECRET || process.env.JWT_SECRET || "linguaplan-dev-secret-uz-2026";

export function getCookieName() {
  return COOKIE_NAME;
}

export async function hashPassword(pw: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function signToken(payload: { id: string; email: string; name: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): { id: string; email: string; name: string } | null {
  try {
    return jwt.verify(token, SECRET) as { id: string; email: string; name: string };
  } catch {
    return null;
  }
}
