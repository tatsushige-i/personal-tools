import type { JsonParseResult, IndentSize } from "./types";

function extractPosition(
  message: string,
  input: string
): { line: number | null; column: number | null } {
  const posMatch = message.match(/position\s+(\d+)/i);
  if (!posMatch) return { line: null, column: null };

  const position = parseInt(posMatch[1], 10);
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
