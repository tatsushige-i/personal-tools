import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="markdown-input">Markdown</Label>
      <Textarea
        id="markdown-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter Markdown here..."
        className="min-h-[500px] resize-y font-mono text-sm"
      />
    </div>
  );
}
