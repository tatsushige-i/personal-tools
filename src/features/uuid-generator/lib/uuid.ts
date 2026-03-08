import type { IdType } from "./types";

/**
 * Generate UUID v4 using crypto.randomUUID().
 */
export function generateUUIDv4(count: number): string[] {
  return Array.from({ length: count }, () => crypto.randomUUID());
}

/**
 * Generate UUID v7 (RFC 9562).
 * Format: 48-bit timestamp | 4-bit version (0111) | 12-bit rand_a | 2-bit variant (10) | 62-bit rand_b
 */
export function generateUUIDv7(count: number): string[] {
  return Array.from({ length: count }, () => {
    const now = Date.now();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // 48-bit unix timestamp in ms (big-endian)
    bytes[0] = (now / 2 ** 40) & 0xff;
    bytes[1] = (now / 2 ** 32) & 0xff;
    bytes[2] = (now / 2 ** 24) & 0xff;
    bytes[3] = (now / 2 ** 16) & 0xff;
    bytes[4] = (now / 2 ** 8) & 0xff;
    bytes[5] = now & 0xff;

    // version 7: set top 4 bits of byte 6
    bytes[6] = (bytes[6] & 0x0f) | 0x70;

    // variant 10: set top 2 bits of byte 8
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    return formatUUIDBytes(bytes);
  });
}

function formatUUIDBytes(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const CROCKFORD_BASE32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Generate ULID: 10-char timestamp + 16-char randomness (Crockford Base32, 26 chars total).
 */
export function generateULID(count: number): string[] {
  return Array.from({ length: count }, () => {
    const now = Date.now();

    // Encode 48-bit timestamp as 10 Crockford Base32 characters
    let timestamp = now;
    const timeChars: string[] = new Array(10);
    for (let i = 9; i >= 0; i--) {
      timeChars[i] = CROCKFORD_BASE32[timestamp & 0x1f];
      timestamp = Math.floor(timestamp / 32);
    }

    // Encode 80-bit randomness as 16 Crockford Base32 characters
    const randBytes = new Uint8Array(10);
    crypto.getRandomValues(randBytes);
    const randChars: string[] = new Array(16);
    // Convert 10 bytes (80 bits) to 16 base32 chars (5 bits each)
    let bitBuffer = 0;
    let bitsInBuffer = 0;
    let charIndex = 0;
    for (let i = 0; i < 10; i++) {
      bitBuffer = (bitBuffer << 8) | randBytes[i];
      bitsInBuffer += 8;
      while (bitsInBuffer >= 5) {
        bitsInBuffer -= 5;
        randChars[charIndex++] = CROCKFORD_BASE32[(bitBuffer >> bitsInBuffer) & 0x1f];
      }
    }

    return timeChars.join("") + randChars.join("");
  });
}

/**
 * Dispatch to the appropriate generator based on type.
 */
export function generateIds(type: IdType, count: number): string[] {
  switch (type) {
    case "uuidv4":
      return generateUUIDv4(count);
    case "uuidv7":
      return generateUUIDv7(count);
    case "ulid":
      return generateULID(count);
  }
}

/**
 * Format values for clipboard (newline-separated).
 */
export function formatForClipboard(values: string[]): string {
  return values.join("\n");
}
