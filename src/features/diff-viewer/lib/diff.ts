import { diffLines, diffWords, createPatch } from "diff";
import type {
  DiffMode,
  InputMode,
  DiffLine,
  DiffChunk,
  DiffResult,
  JsonNormalizeResult,
  ChangeType,
} from "./types";

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as object)
        .sort()
        .map((k) => [k, sortKeys((value as Record<string, unknown>)[k])])
    );
  }
  return value;
}

export function normalizeJson(input: string): JsonNormalizeResult {
  try {
    const parsed: unknown = JSON.parse(input);
    return { success: true, normalized: JSON.stringify(sortKeys(parsed), null, 2) };
  } catch (e) {
    return {
      success: false,
      error: e instanceof SyntaxError ? e.message : "Unknown error",
    };
  }
}

function buildDiffLines(changes: ReturnType<typeof diffLines>): DiffLine[] {
  const lines: DiffLine[] = [];
  let leftLineNum = 1;
  let rightLineNum = 1;

  let i = 0;
  while (i < changes.length) {
    const change = changes[i];

    if (change.removed) {
      // Peek ahead: if next chunk is added, pair them
      const next = changes[i + 1];
      const removedLines = change.value.replace(/\n$/, "").split("\n");

      if (next?.added) {
        const addedLines = next.value.replace(/\n$/, "").split("\n");
        const maxLen = Math.max(removedLines.length, addedLines.length);
        for (let j = 0; j < maxLen; j++) {
          const leftLine = removedLines[j] !== undefined ? removedLines[j] : null;
          const rightLine = addedLines[j] !== undefined ? addedLines[j] : null;
          lines.push({
            left: leftLine !== null ? { lineNumber: leftLineNum++, content: leftLine, type: "removed" } : null,
            right: rightLine !== null ? { lineNumber: rightLineNum++, content: rightLine, type: "added" } : null,
          });
        }
        i += 2;
      } else {
        for (const line of removedLines) {
          lines.push({
            left: { lineNumber: leftLineNum++, content: line, type: "removed" },
            right: null,
          });
        }
        i += 1;
      }
    } else if (change.added) {
      const addedLines = change.value.replace(/\n$/, "").split("\n");
      for (const line of addedLines) {
        lines.push({
          left: null,
          right: { lineNumber: rightLineNum++, content: line, type: "added" },
        });
      }
      i += 1;
    } else {
      // unchanged
      const unchangedLines = change.value.replace(/\n$/, "").split("\n");
      for (const line of unchangedLines) {
        lines.push({
          left: { lineNumber: leftLineNum++, content: line, type: "unchanged" },
          right: { lineNumber: rightLineNum++, content: line, type: "unchanged" },
        });
      }
      i += 1;
    }
  }

  return lines;
}

export function computeDiff(
  left: string,
  right: string,
  mode: DiffMode,
  inputMode: InputMode
): DiffResult {
  let effectiveLeft = left;
  let effectiveRight = right;

  if (inputMode === "json") {
    const leftResult = normalizeJson(left);
    const rightResult = normalizeJson(right);
    if (!leftResult.success) {
      return { success: false, error: `左のJSON: ${leftResult.error}` };
    }
    if (!rightResult.success) {
      return { success: false, error: `右のJSON: ${rightResult.error}` };
    }
    effectiveLeft = leftResult.normalized;
    effectiveRight = rightResult.normalized;
  }

  // diffLines はテキストが改行で終わらない場合に行の対応がずれるため正規化する
  const normalizeEol = (s: string) => (s && !s.endsWith("\n") ? s + "\n" : s);

  if (mode === "line") {
    const changes = diffLines(normalizeEol(effectiveLeft), normalizeEol(effectiveRight));
    const lines = buildDiffLines(changes);
    const chunks: DiffChunk[] = changes.map((c) => ({
      type: (c.added ? "added" : c.removed ? "removed" : "unchanged") as ChangeType,
      value: c.value,
    }));
    return { success: true, lines, chunks };
  } else {
    const changes = diffWords(effectiveLeft, effectiveRight);
    const chunks: DiffChunk[] = changes.map((c) => ({
      type: (c.added ? "added" : c.removed ? "removed" : "unchanged") as ChangeType,
      value: c.value,
    }));
    return { success: true, lines: [], chunks };
  }
}

export function exportUnifiedDiff(
  left: string,
  right: string,
  inputMode: InputMode,
  leftLabel = "original",
  rightLabel = "modified"
): string {
  let effectiveLeft = left;
  let effectiveRight = right;

  if (inputMode === "json") {
    const leftResult = normalizeJson(left);
    const rightResult = normalizeJson(right);
    if (leftResult.success) effectiveLeft = leftResult.normalized;
    if (rightResult.success) effectiveRight = rightResult.normalized;
  }

  return createPatch("diff", effectiveLeft, effectiveRight, leftLabel, rightLabel);
}
