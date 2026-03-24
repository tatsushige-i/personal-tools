import type { Metadata } from "next";
import { UuidGeneratorPage } from "@/features/uuid-generator/components/uuid-generator-page";

export const metadata: Metadata = {
  title: "UUID Generator - Personal Tools",
  description: "UUID v4/v7・ULID生成、一括生成＆コピー",
};

export default function Page() {
  return <UuidGeneratorPage />;
}
