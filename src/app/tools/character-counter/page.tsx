import type { Metadata } from "next";
import { CharacterCounterPage } from "@/features/character-counter/components/character-counter-page";

export const metadata: Metadata = {
  title: "Character Counter - Personal Tools",
  description:
    "文字数・単語数・行数・バイト数のリアルタイムカウント、プラットフォーム別残り文字数表示",
};

export default function Page() {
  return <CharacterCounterPage />;
}
