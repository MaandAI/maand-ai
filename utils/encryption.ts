import crypto from "crypto";

// Use a 32-byte key from environment variables, fallback is only for demonstration (INSECURE)
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "12345678901234567890123456789012";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;

export function encryptData(text: string): string {
  if (!text) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Key derivation (PBKDF2) adds security against brute force
  const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, "sha512");

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: iv:salt:authTag:encryptedData
  return `${iv.toString("hex")}:${salt.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decryptData(encryptedStr: string): string {
  if (!encryptedStr || !encryptedStr.includes(":")) return encryptedStr;

  try {
    const parts = encryptedStr.split(":");

    if (parts.length !== 4) throw new Error("Invalid encrypted format");

    const iv = Buffer.from(parts[0], "hex");
    const salt = Buffer.from(parts[1], "hex");
    const authTag = Buffer.from(parts[2], "hex");
    const encryptedText = parts[3];

    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, "sha512");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (e) {
    console.error("Decryption failed:", e);
    // Fallback: return original if it wasn't actually encrypted or keys mismatched
    // In strict compliance, you'd throw an error here.
    return "[[ENCRYPTED_OR_CORRUPTED]]";
  }
}
