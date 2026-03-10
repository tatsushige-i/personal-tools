import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemInstruction, REWRITE_MODE_OPTIONS } from "@/features/text-rewriter/lib/rewriter";
import type { RewriteMode } from "@/features/text-rewriter/lib/types";
import { sanitizeInput, buildSystemPrompt, validateOutput } from "@/lib/ai";

const VALID_MODES: RewriteMode[] = REWRITE_MODE_OPTIONS.map((opt) => opt.value);

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY が設定されていません。" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が不正です。" },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "リクエストの形式が不正です。" },
      { status: 400 }
    );
  }

  const { text, mode } = body as Record<string, unknown>;

  if (typeof text !== "string" || typeof mode !== "string") {
    return NextResponse.json(
      { error: "text と mode は文字列で指定してください。" },
      { status: 400 }
    );
  }

  if (!VALID_MODES.includes(mode as RewriteMode)) {
    return NextResponse.json(
      { error: "無効なモードです。" },
      { status: 400 }
    );
  }

  const validation = sanitizeInput(text);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
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
      return NextResponse.json({ error: outputCheck.error }, { status: 500 });
    }

    return NextResponse.json({ result: responseText });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "AIモデルの呼び出しに失敗しました。しばらく経ってから再度お試しください。" },
      { status: 500 }
    );
  }
}
