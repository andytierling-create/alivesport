import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const PREFIX = "scrypt";

export function isHashedPassword(stored: string) {
  return stored.startsWith(`${PREFIX}:`);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${PREFIX}:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  if (!isHashedPassword(stored)) {
    return stored === password;
  }
  const [, salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const previous = Buffer.from(hash, "hex");
  if (previous.length !== next.length) return false;
  return timingSafeEqual(previous, next);
}
