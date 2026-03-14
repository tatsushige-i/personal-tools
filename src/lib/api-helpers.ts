export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function rateLimitResponse(retryAfterMs: number): Response {
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

  return Response.json(
    { error: "リクエストが多すぎます。しばらく経ってから再度お試しください。" },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}
