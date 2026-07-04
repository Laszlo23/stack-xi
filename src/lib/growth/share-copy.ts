import { FC_BUILDERS } from "@/lib/story/farcaster-builders";
import { absoluteUrl, SITE_URL } from "@/lib/seo/site-config";

export type BuildSharePostOptions = {
  path?: string;
  tagCount?: number;
  tagSeed?: number;
  includeTags?: boolean;
  includeUrl?: boolean;
};

/** Rotate honor tags — story universe, not spam. */
export function getRotatingBuilderTags(count = 3, seed?: number): string[] {
  const dayIndex = seed ?? new Date().getDate();
  const start = dayIndex % FC_BUILDERS.length;
  return Array.from({ length: count }, (_, i) => FC_BUILDERS[(start + i) % FC_BUILDERS.length].handle);
}

export function getRotatingBuilderTagsLine(count = 3, seed?: number): string {
  return getRotatingBuilderTags(count, seed).join(" ");
}

export function buildSharePost(
  lines: string | readonly string[],
  options: BuildSharePostOptions = {},
): string {
  const {
    path = "/",
    tagCount = 3,
    tagSeed,
    includeTags = true,
    includeUrl = true,
  } = options;

  const body = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
  const parts = [...body];

  if (includeTags) {
    parts.push(getRotatingBuilderTagsLine(tagCount, tagSeed));
  }
  if (includeUrl) {
    parts.push(absoluteUrl(path));
  }

  return parts.join("\n");
}

/** Append URL + tags to legacy copy that may be missing them. */
export function ensureShareUrl(text: string, path = "/"): string {
  const hasUrl = text.includes(SITE_URL) || text.includes("pepe.buildingcultureid.space");
  const tagCount = (text.match(/@\w+/g) ?? []).length;
  const lines = [text.trim()];

  if (tagCount < 3) {
    lines.push(getRotatingBuilderTagsLine(3 - tagCount));
  }
  if (!hasUrl) {
    lines.push(absoluteUrl(path));
  }

  return lines.join("\n");
}

/** Short X post with URL + 3 tags (for viral calendar xPost fields). */
export function buildXPost(body: string, options?: Omit<BuildSharePostOptions, "includeTags" | "includeUrl">): string {
  return buildSharePost([body], { ...options, includeTags: true, includeUrl: true });
}
