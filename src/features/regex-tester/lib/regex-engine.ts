import type {
  RegexFlags,
  RegexResult,
  MatchResult,
  CaptureGroup,
  TextSegment,
} from "./types";

const MAX_MATCH_ITERATIONS = 10000;

export function buildRegex(pattern: string, flags: RegexFlags): RegExp {
  const flagStr = (Object.keys(flags) as (keyof RegexFlags)[])
    .filter((f) => flags[f])
    .join("");
  return new RegExp(pattern, flagStr);
}

export function findMatches(
  pattern: string,
  flags: RegexFlags,
  testString: string,
): RegexResult {
  if (pattern === "") {
    return { success: true, matches: [] };
  }

  let regex: RegExp;
  try {
    regex = buildRegex(pattern, flags);
  } catch (e) {
    return {
      success: false,
      error: e instanceof SyntaxError ? e.message : String(e),
    };
  }

  const matches: MatchResult[] = [];

  if (flags.g) {
    let match: RegExpExecArray | null;
    let iterations = 0;
    while ((match = regex.exec(testString)) !== null) {
      matches.push(toMatchResult(match));
      if (match[0].length === 0) {
        regex.lastIndex++;
      }
      iterations++;
      if (iterations >= MAX_MATCH_ITERATIONS) break;
    }
  } else {
    const match = regex.exec(testString);
    if (match) {
      matches.push(toMatchResult(match));
    }
  }

  return { success: true, matches };
}

function toMatchResult(match: RegExpExecArray): MatchResult {
  const groups: CaptureGroup[] = [];
  const namedGroups = match.groups ?? {};
  const nameByIndex = new Map<number, string>();

  // Map named groups to their indices by matching values in order
  const usedIndices = new Set<number>();
  for (const [name, value] of Object.entries(namedGroups)) {
    for (let i = 1; i < match.length; i++) {
      if (!usedIndices.has(i) && match[i] === value) {
        nameByIndex.set(i, name);
        usedIndices.add(i);
        break;
      }
    }
  }

  for (let i = 1; i < match.length; i++) {
    groups.push({
      index: i,
      name: nameByIndex.get(i) ?? null,
      value: match[i] ?? "",
    });
  }

  return {
    fullMatch: match[0],
    start: match.index,
    end: match.index + match[0].length,
    groups,
  };
}

export function buildSegments(
  testString: string,
  matches: MatchResult[],
): TextSegment[] {
  if (matches.length === 0) {
    return testString ? [{ type: "text", value: testString }] : [];
  }

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    if (m.start > cursor) {
      segments.push({ type: "text", value: testString.slice(cursor, m.start) });
    }
    segments.push({ type: "match", value: m.fullMatch, matchIndex: i });
    cursor = m.end;
  }

  if (cursor < testString.length) {
    segments.push({ type: "text", value: testString.slice(cursor) });
  }

  return segments;
}

export function computeReplacement(
  pattern: string,
  flags: RegexFlags,
  testString: string,
  replacement: string,
): string | null {
  if (pattern === "") return null;
  try {
    const regex = buildRegex(pattern, flags);
    return testString.replace(regex, replacement);
  } catch {
    return null;
  }
}
