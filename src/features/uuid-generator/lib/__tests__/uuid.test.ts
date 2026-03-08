import {
  generateUUIDv4,
  generateUUIDv7,
  generateULID,
  generateIds,
  formatForClipboard,
} from "../uuid";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const UUID_V7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const ULID_REGEX = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

describe("generateUUIDv4", () => {
  it("generates a valid UUID v4 format", () => {
    const [uuid] = generateUUIDv4(1);
    expect(uuid).toMatch(UUID_V4_REGEX);
  });

  it("returns the requested count", () => {
    const results = generateUUIDv4(5);
    expect(results).toHaveLength(5);
  });

  it("generates unique values", () => {
    const results = generateUUIDv4(100);
    expect(new Set(results).size).toBe(100);
  });
});

describe("generateUUIDv7", () => {
  it("generates a valid UUID v7 format", () => {
    const [uuid] = generateUUIDv7(1);
    expect(uuid).toMatch(UUID_V7_REGEX);
  });

  it("returns the requested count", () => {
    const results = generateUUIDv7(5);
    expect(results).toHaveLength(5);
  });

  it("generates unique values", () => {
    const results = generateUUIDv7(100);
    expect(new Set(results).size).toBe(100);
  });

  it("embeds a valid timestamp", () => {
    const before = Date.now();
    const [uuid] = generateUUIDv7(1);
    const after = Date.now();
    // Extract 48-bit timestamp from first 12 hex chars (positions 0-7 and 9-12, skipping dash)
    const hex = uuid.replace(/-/g, "").slice(0, 12);
    const timestamp = parseInt(hex, 16);
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });
});

describe("generateULID", () => {
  it("generates a valid ULID format (26 Crockford Base32 chars)", () => {
    const [ulid] = generateULID(1);
    expect(ulid).toMatch(ULID_REGEX);
    expect(ulid).toHaveLength(26);
  });

  it("returns the requested count", () => {
    const results = generateULID(5);
    expect(results).toHaveLength(5);
  });

  it("generates unique values", () => {
    const results = generateULID(100);
    expect(new Set(results).size).toBe(100);
  });
});

describe("generateIds", () => {
  it("dispatches to uuidv4", () => {
    const results = generateIds("uuidv4", 3);
    expect(results).toHaveLength(3);
    results.forEach((id) => expect(id).toMatch(UUID_V4_REGEX));
  });

  it("dispatches to uuidv7", () => {
    const results = generateIds("uuidv7", 3);
    expect(results).toHaveLength(3);
    results.forEach((id) => expect(id).toMatch(UUID_V7_REGEX));
  });

  it("dispatches to ulid", () => {
    const results = generateIds("ulid", 3);
    expect(results).toHaveLength(3);
    results.forEach((id) => expect(id).toMatch(ULID_REGEX));
  });

  it("handles count of 1", () => {
    expect(generateIds("uuidv4", 1)).toHaveLength(1);
  });

  it("handles count of 100", () => {
    expect(generateIds("uuidv4", 100)).toHaveLength(100);
  });
});

describe("formatForClipboard", () => {
  it("joins values with newlines", () => {
    const result = formatForClipboard(["aaa", "bbb", "ccc"]);
    expect(result).toBe("aaa\nbbb\nccc");
  });

  it("returns single value as-is", () => {
    const result = formatForClipboard(["single"]);
    expect(result).toBe("single");
  });

  it("returns empty string for empty array", () => {
    const result = formatForClipboard([]);
    expect(result).toBe("");
  });
});
