import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyHtmlToClipboard } from "../lib/clipboard";
import type { CopyStatus } from "../lib/types";

type CopyHtmlButtonProps = {
  previewRef: React.RefObject<HTMLDivElement | null>;
};

export function CopyHtmlButton({ previewRef }: CopyHtmlButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  const handleCopy = useCallback(async () => {
    const el = previewRef.current;
    if (!el) return;

    const success = await copyHtmlToClipboard(el.innerHTML, el.innerText);
    setStatus(success ? "copied" : "error");
    setTimeout(() => setStatus("idle"), 2000);
  }, [previewRef]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      disabled={status === "copied"}
    >
      {status === "copied" ? (
        <>
          <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Copied
        </>
      ) : (
        <>
          <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Copy HTML
        </>
      )}
    </Button>
  );
}
