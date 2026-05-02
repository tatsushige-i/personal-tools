import Link from "next/link";
import { ArrowRight, ArrowLeftRight, Braces, Calculator, Clock, Cloud, Coins, FileText, Fingerprint, FileDiff, Github, Languages, Palette, Package, QrCode, Regex, Timer, Type, type LucideIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const CATEGORIES = [
  { id: "text", label: "テキスト" },
  { id: "encode-convert", label: "エンコード / 変換" },
  { id: "generator", label: "ジェネレーター" },
  { id: "dev-support", label: "開発支援" },
  { id: "calc-time", label: "計算 / 時間" },
  { id: "external-api", label: "外部API活用" },
] as const;

type ToolCategory = (typeof CATEGORIES)[number]["id"];

type Tool = {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category: ToolCategory;
};

const tools: Tool[] = [
  {
    name: "UUID Generator",
    description: "UUID v4/v7・ULID生成、一括生成＆コピー",
    href: "/tools/uuid-generator",
    icon: Fingerprint,
    category: "generator",
  },
  {
    name: "Text Rewriter",
    description: "テキストのトーン変換・翻訳・要約・校正",
    href: "/tools/text-rewriter",
    icon: Languages,
    category: "text",
  },
  {
    name: "JSON Formatter",
    description: "JSONの整形・検証",
    href: "/tools/json-formatter",
    icon: Braces,
    category: "encode-convert",
  },
  {
    name: "Markdown Preview",
    description: "Markdownのリアルタイムプレビュー・HTMLコピー",
    href: "/tools/markdown-preview",
    icon: FileText,
    category: "text",
  },
  {
    name: "Base64 Encoder / Decoder",
    description: "テキスト⇔Base64の相互変換、ファイルエンコード・Data URI生成",
    href: "/tools/base64-encoder-decoder",
    icon: Package,
    category: "encode-convert",
  },
  {
    name: "Cron Expression Editor",
    description: "Cron式の組み立て・検証、次回実行予定の表示",
    href: "/tools/cron-expression-editor",
    icon: Clock,
    category: "dev-support",
  },
  {
    name: "Color Converter",
    description: "HEX / RGB / HSL / Tailwind色名の相互変換、コントラスト比チェック",
    href: "/tools/color-converter",
    icon: Palette,
    category: "encode-convert",
  },
  {
    name: "Diff Viewer",
    description: "テキスト・JSONの差分表示、行単位/単語単位のdiffモード、unified diffエクスポート",
    href: "/tools/diff-viewer",
    icon: FileDiff,
    category: "text",
  },
  {
    name: "Character Counter",
    description: "文字数・単語数・行数・バイト数のリアルタイムカウント、プラットフォーム別残り文字数表示",
    href: "/tools/character-counter",
    icon: Type,
    category: "text",
  },
  {
    name: "Regex Tester",
    description: "正規表現のパターンマッチをリアルタイムで検証、キャプチャグループ表示、置換プレビュー",
    href: "/tools/regex-tester",
    icon: Regex,
    category: "dev-support",
  },
  {
    name: "QR Code Generator",
    description: "URLやテキストからQRコード生成、サイズ・色・ロゴのカスタマイズ、PNG/SVGダウンロード",
    href: "/tools/qr-code-generator",
    icon: QrCode,
    category: "generator",
  },
  {
    name: "Unit Converter",
    description: "長さ・重さ・温度など各種単位を変換、計算式の表示",
    href: "/tools/unit-converter",
    icon: ArrowLeftRight,
    category: "encode-convert",
  },
  {
    name: "Split Bill Calculator",
    description: "割り勘計算、端数処理、傾斜配分、税・サービス料の別計算",
    href: "/tools/split-bill-calculator",
    icon: Calculator,
    category: "calc-time",
  },
  {
    name: "Timer / Stopwatch",
    description: "カウントダウンタイマー・ストップウォッチ、プリセット・複数同時実行・ブラウザ通知",
    href: "/tools/timer-stopwatch",
    icon: Timer,
    category: "calc-time",
  },
  {
    name: "Weather Dashboard",
    description: "現在地または都市名検索で現在の天気・時間別気温・週間予報を表示",
    href: "/tools/weather-dashboard",
    icon: Cloud,
    category: "external-api",
  },
  {
    name: "Exchange Rate Calculator",
    description: "ECB公表の日次為替レートで通貨変換、お気に入り通貨ペア・30日推移グラフ",
    href: "/tools/exchange-rate-calculator",
    icon: Coins,
    category: "external-api",
  },
  {
    name: "GitHub Repo Analyzer",
    description: "GitHubユーザーの公開リポジトリ一覧と統計を可視化",
    href: "/tools/github-repo-analyzer",
    icon: Github,
    category: "external-api",
  },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Personal Tools</h1>
      <p className="mt-2 text-muted-foreground">
        A collection of utility tools.
      </p>

      {tools.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
          <p className="text-muted-foreground">
            No tools yet. Add your first tool to get started.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {CATEGORIES.map(({ id, label }) => {
            const categoryTools = tools.filter((tool) => tool.category === id);
            if (categoryTools.length === 0) return null;
            return (
              <section key={id}>
                <h2 className="text-xl font-semibold tracking-tight">{label}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {categoryTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link key={tool.href} href={tool.href} className="h-full">
                        <Card className="group h-full transition-colors hover:bg-muted/50">
                          <CardHeader className="flex flex-row items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <CardTitle className="flex items-center justify-between">
                                {tool.name}
                                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground" aria-hidden="true" />
                              </CardTitle>
                              <CardDescription>{tool.description}</CardDescription>
                            </div>
                          </CardHeader>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
