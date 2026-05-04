import { toCsv } from "@/lib/csv-export";

describe("toCsv", () => {
  it("joins headers and rows with CRLF", () => {
    const csv = toCsv(["a", "b"], [["1", "2"], ["3", "4"]]);
    expect(csv).toBe("a,b\r\n1,2\r\n3,4");
  });

  it("escapes cells containing commas with double quotes", () => {
    const csv = toCsv(["name"], [["foo, bar"]]);
    expect(csv).toBe('name\r\n"foo, bar"');
  });

  it("escapes embedded double quotes by doubling them", () => {
    const csv = toCsv(["name"], [['he said "hi"']]);
    expect(csv).toBe('name\r\n"he said ""hi"""');
  });

  it("escapes cells containing CR or LF", () => {
    const csv = toCsv(["text"], [["line1\nline2"]]);
    expect(csv).toBe('text\r\n"line1\nline2"');
  });

  it("renders null and undefined as empty strings", () => {
    const csv = toCsv(["a", "b", "c"], [[null, undefined, "x"]]);
    expect(csv).toBe("a,b,c\r\n,,x");
  });

  it("stringifies numbers and booleans", () => {
    const csv = toCsv(["n", "b"], [[42, true]]);
    expect(csv).toBe("n,b\r\n42,true");
  });

  it("returns just the header row when rows is empty", () => {
    expect(toCsv(["x"], [])).toBe("x");
  });
});
