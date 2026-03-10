import type { JsonParseResult, IndentSize } from "./types";

function positionToLineColumn(
  position: number,
  input: string
): { line: number; column: number } {
  let line = 1;
  let column = 1;
  for (let i = 0; i < position && i < input.length; i++) {
    if (input[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

function extractPosition(
  message: string,
  input: string
): { line: number | null; column: number | null } {
  // Pattern 1: "position N" (V8, etc.)
  const posMatch = message.match(/position\s+(\d+)/i);
  if (posMatch) {
    return positionToLineColumn(parseInt(posMatch[1], 10), input);
  }

  // Pattern 2: "line N column N" (some engines)
  const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    return {
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
    };
  }

  return { line: null, column: null };
}

export function parseJson(input: string): JsonParseResult {
  if (input.trim() === "") {
    return {
      success: false,
      error: { message: "Empty input", line: null, column: null },
    };
  }
  try {
    const data: unknown = JSON.parse(input);
    return { success: true, data };
  } catch (e) {
    const message = e instanceof SyntaxError ? e.message : "Unknown error";
    const { line, column } = extractPosition(message, input);
    return { success: false, error: { message, line, column } };
  }
}

export function formatJson(input: string, indent: IndentSize): string {
  const parsed: unknown = JSON.parse(input);
  return JSON.stringify(parsed, null, indent);
}

export function minifyJson(input: string): string {
  const parsed: unknown = JSON.parse(input);
  return JSON.stringify(parsed);
}
