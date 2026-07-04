import { useRef, useState } from "react";
import { downloadElementAsPng, shareCardFilename } from "@/lib/share/download-png";

export function useShareCardDownload() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download(filenamePrefix: string, onDownloaded?: () => void) {
    const target = cardRef.current;
    if (!target) {
      setError("Card not ready");
      return;
    }

    setExporting(true);
    setError(null);
    try {
      await downloadElementAsPng(target, shareCardFilename(filenamePrefix));
      onDownloaded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  return { cardRef, download, exporting, error };
}
