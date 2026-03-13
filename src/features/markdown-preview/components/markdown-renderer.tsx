import { forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "./highlight-theme.css";

type MarkdownRendererProps = {
  content: string;
};

export const MarkdownRenderer = forwardRef<HTMLDivElement, MarkdownRendererProps>(
  function MarkdownRenderer({ content }, ref) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Preview</p>
        <div
          ref={ref}
          className="min-h-[500px] rounded-md border border-input bg-transparent p-4 prose dark:prose-invert max-w-none"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  },
);
