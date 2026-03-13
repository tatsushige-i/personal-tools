"use client";

import { useState, useRef } from "react";
import { MarkdownEditor } from "./markdown-editor";
import { MarkdownRenderer } from "./markdown-renderer";
import { CopyHtmlButton } from "./copy-html-button";
import { defaultMarkdown } from "../lib/default-content";

export function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Markdown Preview
          </h1>
          <p className="mt-2 text-muted-foreground">
            Markdownのリアルタイムプレビュー・HTMLコピー
          </p>
        </div>
        <CopyHtmlButton previewRef={previewRef} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MarkdownEditor value={markdown} onChange={setMarkdown} />
        <MarkdownRenderer ref={previewRef} content={markdown} />
      </div>
    </div>
  );
}
