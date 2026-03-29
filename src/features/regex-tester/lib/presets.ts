import type { Preset } from "./types";

const FLAGS_G = { g: true, i: false, m: false, s: false } as const;
const FLAGS_GI = { g: true, i: true, m: false, s: false } as const;

export const PRESETS: Preset[] = [
  {
    name: "メールアドレス",
    pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}",
    flags: FLAGS_GI,
    description: "一般的なメールアドレスにマッチ",
    testExample: "連絡先: user@example.com または admin@test.co.jp まで",
  },
  {
    name: "URL",
    pattern: "https?://[\\w\\-]+(\\.[\\w\\-]+)+[\\w.,@?^=%&:/~+#\\-]*",
    flags: FLAGS_G,
    description: "HTTP/HTTPSのURLにマッチ",
    testExample: "詳細は https://example.com/path?q=1 を参照",
  },
  {
    name: "電話番号（日本）",
    pattern: "0\\d{1,4}-\\d{1,4}-\\d{4}",
    flags: FLAGS_G,
    description: "ハイフン区切りの日本の電話番号にマッチ",
    testExample: "TEL: 03-1234-5678 / 090-1234-5678",
  },
  {
    name: "日付（YYYY-MM-DD）",
    pattern: "\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])",
    flags: FLAGS_G,
    description: "ISO 8601形式の日付にマッチ",
    testExample: "開始日: 2026-03-29 終了日: 2026-12-31",
  },
  {
    name: "IPv4アドレス",
    pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
    flags: FLAGS_G,
    description: "IPv4アドレスにマッチ",
    testExample: "サーバー: 192.168.1.1 ゲートウェイ: 10.0.0.1",
  },
  {
    name: "HTMLタグ",
    pattern: "<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)</\\1>",
    flags: { g: true, i: false, m: false, s: true },
    description: "開始タグと閉じタグのペアにマッチ",
    testExample: '<div class="x">content</div><span>text</span>',
  },
];
