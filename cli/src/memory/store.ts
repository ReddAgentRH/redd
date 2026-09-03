// cli/src/memory/store.ts
import { scryptSync, randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { Memory, canonicalize } from "./model.js";

function key(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, 32);
}

export function seal(m: Memory, password: string): string {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(password, salt), iv);
  const pt = Buffer.from(canonicalize(m), "utf8");
  const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, tag, ct]).toString("base64");
}

export function open(blob: string, password: string): Memory {
  try {
    const buf = Buffer.from(blob, "base64");
    const salt = buf.subarray(0, 16);
    const iv = buf.subarray(16, 28);
    const tag = buf.subarray(28, 44);
    const ct = buf.subarray(44);
    const decipher = createDecipheriv("aes-256-gcm", key(password, salt), iv);
    decipher.setAuthTag(tag);
    const pt = Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
    return JSON.parse(pt) as Memory;
  } catch {
    throw new Error("bad password or corrupt memory");
  }
}
