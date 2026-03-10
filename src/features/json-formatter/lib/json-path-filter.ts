type PathSegment =
  | { type: "property"; key: string }
  | { type: "index"; index: number };

export function parsePath(path: string): PathSegment[] {
  const trimmed = path.trim();
  if (trimmed === "" || trimmed === ".") return [];

  const segments: PathSegment[] = [];
  let i = 0;

  // Skip leading dot
  if (trimmed[i] === ".") i++;

  while (i < trimmed.length) {
    if (trimmed[i] === "[") {
      const end = trimmed.indexOf("]", i);
      if (end === -1) throw new Error("Unclosed bracket in path");
      const content = trimmed.slice(i + 1, end);

      // ["key"] — quoted string key
      if (
        (content.startsWith('"') && content.endsWith('"')) ||
        (content.startsWith("'") && content.endsWith("'"))
      ) {
        const key = content.slice(1, -1);
        segments.push({ type: "property", key });
      } else {
        // [0] — numeric index
        const index = parseInt(content, 10);
        if (isNaN(index)) throw new Error(`Invalid bracket content: ${content}`);
        segments.push({ type: "index", index });
      }
      i = end + 1;
      // Skip dot after bracket
      if (i < trimmed.length && trimmed[i] === ".") i++;
    } else {
      // Read property key until next dot or bracket
      let end = i;
      while (
        end < trimmed.length &&
        trimmed[end] !== "." &&
        trimmed[end] !== "["
      ) {
        end++;
      }
      if (end === i) throw new Error(`Unexpected character at position ${i}`);
      segments.push({ type: "property", key: trimmed.slice(i, end) });
      i = end;
      // Skip dot separator
      if (i < trimmed.length && trimmed[i] === ".") i++;
    }
  }

  return segments;
}

export function applyPathFilter(data: unknown, path: string): unknown {
  const segments = parsePath(path);
  let current: unknown = data;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      throw new Error(`Cannot access property of ${current}`);
    }
    if (segment.type === "property") {
      if (typeof current !== "object" || Array.isArray(current)) {
        throw new Error(
          `Cannot access property "${segment.key}" on non-object`
        );
      }
      const obj = current as Record<string, unknown>;
      if (!(segment.key in obj)) {
        throw new Error(`Property "${segment.key}" not found`);
      }
      current = obj[segment.key];
    } else {
      if (!Array.isArray(current)) {
        throw new Error(
          `Cannot access index [${segment.index}] on non-array`
        );
      }
      if (segment.index < 0 || segment.index >= current.length) {
        throw new Error(
          `Index ${segment.index} out of bounds (length: ${current.length})`
        );
      }
      current = current[segment.index];
    }
  }

  return current;
}
