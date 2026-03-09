import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildPrompt, validateInput } from "@/features/text-rewriter/lib/rewriter";
import type { RewriteMode } from "@/features/text-rewriter/lib/types";

const VALID_MODES: RewriteMode[] = [
  "casual-to-business",
  "business-to-casual",
  "ja-to-en",
  "en-to-ja",
  "summarize",
  "proofread",
];

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

  const { text, mode } = body as { text?: string; mode?: string };

  if (!text || !mode) {
    return NextResponse.json(
      { error: "text と mode は必須です。" },
      { status: 400 }
    );
  }

  if (!VALID_MODES.includes(mode as RewriteMode)) {
    return NextResponse.json(
      { error: "無効なモードです。" },
      { status: 400 }
    );
  }

  const validation = validateInput(text);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = buildPrompt(text, mode as RewriteMode);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ result: responseText });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "AIモデルの呼び出しに失敗しました。しばらく経ってから再度お試しください。" },
      { status: 500 }
    );
  }
}
