// otplib v13 confirmed API:
//   generateSecret()            → string
//   generateSync({ secret })    → token string
//   verifySync({ token, secret }) → { valid: boolean, delta: number, ... }
//   generateURI({ type, label, params: { secret, issuer } }) → otpauth:// URL
//
// No .authenticator or .totp sub-objects exist in this version.
import qrcode from "qrcode";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const otplib = require("otplib");

export class TwoFactorService {
  static generateSecret(): string {
    return otplib.generateSecret();
  }

  static async generateQRCode(email: string, secret: string): Promise<string> {
    const uri = otplib.generateURI({
      type: "totp",
      label: `Maand:${email}`,
      params: { secret, issuer: "Maand AI" },
    });
    return qrcode.toDataURL(uri);
  }

  static verifyToken(token: string, secret: string): boolean {
    try {
      const result = otplib.verifySync({ token, secret });
      // result is { valid: boolean, delta, epoch, timeStep }
      return result?.valid === true;
    } catch {
      return false;
    }
  }

  static generateBackupCodes(count = 10): string[] {
    return Array.from({ length: count }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  }
}
