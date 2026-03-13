export async function copyHtmlToClipboard(
  html: string,
  plainText: string,
): Promise<boolean> {
  try {
    const htmlBlob = new Blob([html], { type: "text/html" });
    const textBlob = new Blob([plainText], { type: "text/plain" });
    const item = new ClipboardItem({
      "text/html": htmlBlob,
      "text/plain": textBlob,
    });
    await navigator.clipboard.write([item]);
    return true;
  } catch {
    return false;
  }
}
