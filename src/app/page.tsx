import Link from "next/link";
import { ArrowRight, Braces, Clock, FileText, Fingerprint, Languages, Palette, Package, type LucideIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Tool = {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const tools: Tool[] = [
  {
    name: "UUID Generator",
    description: "UUID v4/v7・ULID生成、一括生成＆コピー",
    href: "/tools/uuid-generator",
    icon: Fingerprint,
  },
  {
    name: "Text Rewriter",
    description: "テキストのトーン変換・翻訳・要約・校正",
    href: "/tools/text-rewriter",
    icon: Languages,
  },
  {
    name: "JSON Formatter",
    description: "JSONの整形・検証",
    href: "/tools/json-formatter",
    icon: Braces,
  },
  {
    name: "Markdown Preview",
    description: "Markdownのリアルタイムプレビュー・HTMLコピー",
    href: "/tools/markdown-preview",
    icon: FileText,
  },
  {
    name: "Base64 Encoder / Decoder",
    description: "テキスト⇔Base64の相互変換、ファイルエンコード・Data URI生成",
    href: "/tools/base64-encoder-decoder",
    icon: Package,
  },
  {
    name: "Cron Expression Editor",
    description: "Cron式の組み立て・検証、次回実行予定の表示",
    href: "/tools/cron-expression-editor",
    icon: Clock,
  },
  {
    name: "Color Converter",
    description: "HEX / RGB / HSL / Tailwind色名の相互変換、コントラスト比チェック",
    href: "/tools/color-converter",
    icon: Palette,
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
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => {
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
      )}
    </div>
  );
}
