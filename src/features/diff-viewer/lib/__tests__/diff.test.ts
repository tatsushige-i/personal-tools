import { normalizeJson, computeDiff, exportUnifiedDiff } from "../diff";

describe("normalizeJson", () => {
  it("有効なJSONをキーソートして整形文字列を返す", () => {
    const result = normalizeJson('{"b": 2, "a": 1}');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.normalized).toBe(JSON.stringify({ a: 1, b: 2 }, null, 2));
    }
  });

  it("ネストオブジェクトも再帰的にキーソートする", () => {
    const result = normalizeJson('{"z": {"y": 1, "x": 2}}');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.normalized).toBe(JSON.stringify({ z: { x: 2, y: 1 } }, null, 2));
    }
  });

  it("配列の順序は変えない", () => {
    const result = normalizeJson("[3, 1, 2]");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.normalized).toBe(JSON.stringify([3, 1, 2], null, 2));
    }
  });

  it("無効なJSONはsuccess:falseを返す", () => {
    const result = normalizeJson("{invalid}");
    expect(result.success).toBe(false);
  });

  it("空文字列はsuccess:falseを返す", () => {
    const result = normalizeJson("");
    expect(result.success).toBe(false);
  });
});

describe("computeDiff / lineモード", () => {
  it("同一テキストはすべてunchanged", () => {
    const result = computeDiff("hello\nworld", "hello\nworld", "line", "text");
    expect(result.success).toBe(true);
    if (result.success) {
      for (const line of result.lines) {
        expect(line.left?.type).toBe("unchanged");
        expect(line.right?.type).toBe("unchanged");
      }
    }
  });

  it("削除行はleft:removed / right:null", () => {
    const result = computeDiff("line1\nline2", "line1", "line", "text");
    expect(result.success).toBe(true);
    if (result.success) {
      const removedLine = result.lines.find((l) => l.left?.type === "removed");
      expect(removedLine).toBeDefined();
      expect(removedLine?.right).toBeNull();
    }
  });

  it("追加行はleft:null / right:added", () => {
    const result = computeDiff("line1", "line1\nline2", "line", "text");
    expect(result.success).toBe(true);
    if (result.success) {
      const addedLine = result.lines.find((l) => l.right?.type === "added");
      expect(addedLine).toBeDefined();
      expect(addedLine?.left).toBeNull();
    }
  });

  it("変更行は左右ペアとして対応付けられる", () => {
    const result = computeDiff("hello", "world", "line", "text");
    expect(result.success).toBe(true);
    if (result.success) {
      const pairedLine = result.lines.find(
        (l) => l.left?.type === "removed" && l.right?.type === "added"
      );
      expect(pairedLine).toBeDefined();
    }
  });

  it("左が空でも成功し全行addedになる", () => {
    const result = computeDiff("", "line1\nline2", "line", "text");
    expect(result.success).toBe(true);
    if (result.success) {
      const allAdded = result.lines.every((l) => l.right?.type === "added");
      expect(allAdded).toBe(true);
    }
  });

  it("右が空でも成功し全行removedになる", () => {
    const result = computeDiff("line1\nline2", "", "line", "text");
    expect(result.success).toBe(true);
    if (result.success) {
      const allRemoved = result.lines.every((l) => l.left?.type === "removed");
      expect(allRemoved).toBe(true);
    }
  });
});

describe("computeDiff / wordモード", () => {
  it("同一テキストはすべてunchanged chunks", () => {
    const result = computeDiff("hello world", "hello world", "word", "text");
    expect(result.success).toBe(true);
    if (result.success) {
      const allUnchanged = result.chunks.every((c) => c.type === "unchanged");
      expect(allUnchanged).toBe(true);
    }
  });

  it("変更部分の単語がadded/removedに分類される", () => {
    const result = computeDiff("hello world", "hello earth", "word", "text");
    expect(result.success).toBe(true);
    if (result.success) {
      const hasRemoved = result.chunks.some((c) => c.type === "removed");
      const hasAdded = result.chunks.some((c) => c.type === "added");
      expect(hasRemoved).toBe(true);
      expect(hasAdded).toBe(true);
    }
  });
});

describe("computeDiff / JSONモード", () => {
  it("キー順が異なっても正規化後に同じなら差分なし", () => {
    const result = computeDiff(
      '{"b": 2, "a": 1}',
      '{"a": 1, "b": 2}',
      "line",
      "json"
    );
    expect(result.success).toBe(true);
    if (result.success) {
      const allUnchanged = result.lines.every((l) => l.left?.type === "unchanged");
      expect(allUnchanged).toBe(true);
    }
  });

  it("左が無効なJSONはsuccess:falseを返す", () => {
    const result = computeDiff("{invalid}", '{"a": 1}', "line", "json");
    expect(result.success).toBe(false);
  });

  it("右が無効なJSONはsuccess:falseを返す", () => {
    const result = computeDiff('{"a": 1}', "{invalid}", "line", "json");
    expect(result.success).toBe(false);
  });
});

describe("exportUnifiedDiff", () => {
  it("unified diff形式（---/+++ヘッダ含む）を返す", () => {
    const result = exportUnifiedDiff("hello\n", "world\n", "text");
    expect(result).toContain("---");
    expect(result).toContain("+++");
    expect(result).toContain("-hello");
    expect(result).toContain("+world");
  });

  it("labelが--- / +++ヘッダに反映される", () => {
    const result = exportUnifiedDiff("a\n", "b\n", "text", "original", "modified");
    expect(result).toContain("original");
    expect(result).toContain("modified");
  });

  it("JSONモードでキーソート済みの内容でdiffを生成する", () => {
    const result = exportUnifiedDiff(
      '{"b": 2, "a": 1}',
      '{"a": 1, "b": 2}',
      "json"
    );
    // キーソート後は同じなので差分なし（@@ハンクがない）
    expect(result).not.toContain("@@");
  });
});
