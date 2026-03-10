import { parsePath, applyPathFilter } from "../json-path-filter";

describe("parsePath", () => {
  it("returns empty for identity path", () => {
    expect(parsePath(".")).toEqual([]);
    expect(parsePath("")).toEqual([]);
  });

  it("parses single property", () => {
    expect(parsePath(".name")).toEqual([{ type: "property", key: "name" }]);
  });

  it("parses nested properties", () => {
    expect(parsePath(".a.b.c")).toEqual([
      { type: "property", key: "a" },
      { type: "property", key: "b" },
      { type: "property", key: "c" },
    ]);
  });

  it("parses array index", () => {
    expect(parsePath("[0]")).toEqual([{ type: "index", index: 0 }]);
  });

  it("parses mixed path", () => {
    expect(parsePath(".users[0].name")).toEqual([
      { type: "property", key: "users" },
      { type: "index", index: 0 },
      { type: "property", key: "name" },
    ]);
  });

  it("throws on unclosed bracket", () => {
    expect(() => parsePath("[0")).toThrow("Unclosed bracket");
  });

  it("throws on non-numeric unquoted bracket content", () => {
    expect(() => parsePath("[abc]")).toThrow("Invalid bracket content");
  });

  it("parses double-quoted bracket key", () => {
    expect(parsePath('["my key"]')).toEqual([
      { type: "property", key: "my key" },
    ]);
  });

  it("parses single-quoted bracket key", () => {
    expect(parsePath("['my key']")).toEqual([
      { type: "property", key: "my key" },
    ]);
  });

  it("parses empty string key", () => {
    expect(parsePath('.packages[""]')).toEqual([
      { type: "property", key: "packages" },
      { type: "property", key: "" },
    ]);
  });

  it("parses bracket key with dot in name", () => {
    expect(parsePath('.["node_modules/@types/node"]')).toEqual([
      { type: "property", key: "node_modules/@types/node" },
    ]);
  });

  it("rejects float as array index", () => {
    expect(() => parsePath("[1.5]")).toThrow("Invalid bracket content");
  });

  it("rejects scientific notation as array index", () => {
    expect(() => parsePath("[1e2]")).toThrow("Invalid bracket content");
  });

  it("parses key containing closing bracket", () => {
    expect(parsePath('.["a]b"]')).toEqual([
      { type: "property", key: "a]b" },
    ]);
  });

  it("throws on unclosed quote in bracket", () => {
    expect(() => parsePath('.["abc]')).toThrow("Unclosed quote");
  });
});

describe("applyPathFilter", () => {
  const data = {
    users: [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ],
    meta: { count: 2 },
  };

  it("returns data as-is for identity path", () => {
    expect(applyPathFilter(data, ".")).toEqual(data);
  });

  it("accesses top-level property", () => {
    expect(applyPathFilter(data, ".meta")).toEqual({ count: 2 });
  });

  it("accesses nested property", () => {
    expect(applyPathFilter(data, ".meta.count")).toBe(2);
  });

  it("accesses array element", () => {
    expect(applyPathFilter(data, ".users[0]")).toEqual({
      name: "Alice",
      age: 30,
    });
  });

  it("accesses array element property", () => {
    expect(applyPathFilter(data, ".users[1].name")).toBe("Bob");
  });

  it("throws for missing property", () => {
    expect(() => applyPathFilter(data, ".unknown")).toThrow(
      'Property "unknown" not found'
    );
  });

  it("throws for out-of-bounds index", () => {
    expect(() => applyPathFilter(data, ".users[5]")).toThrow("out of bounds");
  });

  it("throws for property access on non-object", () => {
    expect(() => applyPathFilter(data, ".meta.count.foo")).toThrow(
      "non-object"
    );
  });

  it("throws for index access on non-array", () => {
    expect(() => applyPathFilter(data, ".meta[0]")).toThrow("non-array");
  });

  it("accesses empty string key via bracket notation", () => {
    const d = { packages: { "": { version: "1.0.0" } } };
    expect(applyPathFilter(d, '.packages[""].version')).toBe("1.0.0");
  });

  it("accesses key with special characters via bracket notation", () => {
    const d = { "a.b": { "c/d": 42 } };
    expect(applyPathFilter(d, '.["a.b"]["c/d"]')).toBe(42);
  });

  it("does not match prototype properties like toString", () => {
    const d = { a: 1 };
    expect(() => applyPathFilter(d, ".toString")).toThrow(
      'Property "toString" not found'
    );
  });

  it("accesses key containing closing bracket", () => {
    const d = { "a]b": 99 };
    expect(applyPathFilter(d, '.["a]b"]')).toBe(99);
  });
});
