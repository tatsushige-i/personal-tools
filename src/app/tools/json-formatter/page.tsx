import type { Metadata } from "next";
import { JsonFormatterPage } from "@/features/json-formatter/components/json-formatter-page";

export const metadata: Metadata = {
  title: "JSON Formatter - Personal Tools",
  description: "JSONの整形・検証",
};

export default function Page() {
  return <JsonFormatterPage />;
}
