import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemInstruction, REWRITE_MODE_OPTIONS } from "@/features/text-rewriter/lib/rewriter";
import type { RewriteMode } from "@/features/text-rewriter/lib/types";
import { sanitizeInput, containsAttackPattern, buildSystemPrompt, validateOutput } from "@/lib/ai";
import { createRateLimit } from "@/lib/rate-limit";
import { getClientIp, rateLimitResponse } from "@/lib/api-helpers";

const VALID_MODES: RewriteMode[] = REWRITE_MODE_OPTIONS.map((opt) => opt.value);

const rateLimit = createRateLimit({ limit: 10, windowMs: 60_000 });

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (ip !== "unknown") {
    const result = rateLimit.check(ip);
    if (!result.allowed) {
      return rateLimitResponse(result.retryAfterMs);
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY が設定されていません。", errorCode: "SERVER_ERROR" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が不正です。", errorCode: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "リクエストの形式が不正です。", errorCode: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const { text, mode } = body as Record<string, unknown>;

  if (typeof text !== "string" || typeof mode !== "string") {
    return NextResponse.json(
      { error: "text と mode は文字列で指定してください。", errorCode: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  if (!VALID_MODES.includes(mode as RewriteMode)) {
    return NextResponse.json(
      { error: "無効なモードです。", errorCode: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const validation = sanitizeInput(text);
  if (!validation.valid) {
    const errorCode = containsAttackPattern(text)
      ? "PROMPT_INJECTION_DETECTED"
      : "VALIDATION_ERROR";
    return NextResponse.json(
      { error: validation.error, errorCode },
      { status: 400 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const rawInstruction = getSystemInstruction(mode as RewriteMode);
    const systemInstruction = buildSystemPrompt({ systemPrompt: rawInstruction });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
    });

    const result = await model.generateContent(text);
    const responseText = result.response.text();

    const outputCheck = validateOutput(responseText, {
      systemPromptFragments: [rawInstruction, systemInstruction],
    });
    if (!outputCheck.valid) {
      return NextResponse.json(
        { error: outputCheck.error, errorCode: "SERVER_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: responseText });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "AIモデルの呼び出しに失敗しました。しばらく経ってから再度お試しください。", errorCode: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
