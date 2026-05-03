import type { ApiTesterRequest } from "./types";

export function buildCurl(request: ApiTesterRequest): string {
  const parts = [`curl -X ${request.method}`, shellQuote(request.url)];

  for (const [key, value] of Object.entries(request.headers)) {
    parts.push(`-H ${shellQuote(`${key}: ${value}`)}`);
  }

  if (request.body !== null && request.body !== "") {
    parts.push(`--data ${shellQuote(request.body)}`);
  }

  return parts.join(" \\\n  ");
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
