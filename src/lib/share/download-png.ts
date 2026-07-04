import { toPng } from "html-to-image";
import { EXPORT_COLORS } from "@/lib/share/export-colors";

export async function downloadElementAsPng(
  element: HTMLElement,
  filename: string,
  options?: { backgroundColor?: string; scale?: number },
): Promise<void> {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: options?.scale ?? 2,
    backgroundColor: options?.backgroundColor ?? EXPORT_COLORS.bgInner,
    skipFonts: true,
  });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  link.click();
}

export function shareCardFilename(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const slug = prefix.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `stack-xi-${slug}-${date}.png`;
}
