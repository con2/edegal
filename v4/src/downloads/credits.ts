import type { CreditVM } from "@/gallery/types";

export type Platform = "twitter" | "instagram" | "threads" | "bluesky";

/** Display order of the per-platform credit blocks, matching the legacy dialog. */
export const platforms: Platform[] = [
  "twitter",
  "instagram",
  "threads",
  "bluesky",
];

const hosts: Record<string, Platform> = {
  "twitter.com": "twitter",
  "x.com": "twitter",
  "instagram.com": "instagram",
  "threads.net": "threads",
  "bsky.app": "bluesky",
};

/**
 * Reads social media handles out of profile links, e.g. `https://www.instagram.com/name` → `name`.
 * Bluesky profile URLs are `bsky.app/profile/<handle>`; the others carry the handle as the first
 * path segment, Threads with a leading `@`.
 */
export function deriveHandles(
  links: { href: string }[],
): Partial<Record<Platform, string>> {
  const handles: Partial<Record<Platform, string>> = {};
  for (const { href } of links) {
    let url: URL;
    try {
      url = new URL(href);
    } catch {
      continue;
    }
    const platform = hosts[url.hostname.replace(/^www\./, "")];
    if (!platform) continue;
    const segments = url.pathname.split("/").filter(Boolean);
    const raw =
      platform === "bluesky"
        ? segments[0] === "profile"
          ? segments[1]
          : undefined
        : segments[0];
    if (!raw) continue;
    handles[platform] ??= raw.replace(/^@/, "");
  }
  return handles;
}

export interface CreditLine {
  displayName: string;
  isCopyright: boolean;
  description: string;
  /** `@handle` on the platform, or null when the credit has no profile there. */
  handle: string | null;
}

/** Credits for one platform block, copyright holders first. */
export function creditLines(
  credits: CreditVM[],
  platform: Platform | null,
): CreditLine[] {
  return credits
    .map((credit) => ({
      displayName: credit.displayName,
      isCopyright: credit.isCopyright,
      description: credit.description,
      handle: platform ? (deriveHandles(credit.links)[platform] ?? null) : null,
    }))
    .sort((a, b) => Number(b.isCopyright) - Number(a.isCopyright));
}

/** Platforms on which at least one credited person has a profile. */
export function platformsWithHandles(credits: CreditVM[]): Platform[] {
  return platforms.filter((platform) =>
    credits.some((c) => deriveHandles(c.links)[platform]),
  );
}
