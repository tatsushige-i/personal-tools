import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  MAX_INSTRUCTION_LENGTH,
  MAX_JSON_LENGTH,
  SYSTEM_INSTRUCTION,
} from "@/features/json-formatter/lib/json-transform-client";
import { sanitizeInput, containsAttackPattern, buildSystemPrompt, validateOutput } from "@/lib/ai";
import { createRateLimit } from "@/lib/rate-limit";
import { getClientIp, rateLimitResponse } from "@/lib/api-helpers";

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

  const { json, instruction } = body as Record<string, unknown>;

  if (typeof json !== "string" || typeof instruction !== "string") {
    return NextResponse.json(
      { error: "json と instruction は文字列で指定してください。", errorCode: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  if (json.length > MAX_JSON_LENGTH) {
    return NextResponse.json(
      { error: `JSONは${MAX_JSON_LENGTH}文字以内で入力してください。`, errorCode: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  try {
    JSON.parse(json);
  } catch {
    return NextResponse.json(
      { error: "JSONとして解釈できない入力です。", errorCode: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const validation = sanitizeInput(instruction, { maxLength: MAX_INSTRUCTION_LENGTH });
  if (!validation.valid) {
    const errorCode = containsAttackPattern(instruction)
      ? "PROMPT_INJECTION_DETECTED"
      : "VALIDATION_ERROR";
    return NextResponse.json(
      { error: validation.error, errorCode },
      { status: 400 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const systemInstruction = buildSystemPrompt({ systemPrompt: SYSTEM_INSTRUCTION });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
    });

    const userPrompt = `# 変換指示\n${instruction}\n\n# JSON入力\n${json}`;
    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();

    const outputCheck = validateOutput(responseText, {
      maxLength: 20000,
      systemPromptFragments: [SYSTEM_INSTRUCTION, systemInstruction],
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
