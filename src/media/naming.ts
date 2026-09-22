import { slugifyDash } from "@con2/components/helpers";

/** Filename without directory and extension: `DSC_0330.JPG` → `DSC_0330`. */
export function filenameStem(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? filename;
  return base.replace(/\.[^.]+$/, "");
}

export function slugifyFilename(filename: string): string {
  return slugifyDash(filenameStem(filename)) || "photo";
}

/**
 * The number a camera or photographer put in the filename, used only by the explicit
 * "sort by filename" action: `DSC_0330.jpg` → 330, `Mars2175_Tomi-50.jpg` → 50,
 * `Horisontti (93).JPG` → 93. Trailing numbers win over earlier ones.
 */
export function parseOrderingNumber(filename: string): number | null {
  const stem = filenameStem(filename);
  const trailing = stem.match(/(\d+)\s*\)?$/);
  if (trailing) return Number(trailing[1]);
  const anywhere = stem.match(/(\d+)/);
  return anywhere ? Number(anywhere[1]) : null;
}

/** `base`, else `base-2`, `base-3`, … whichever is not yet taken. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}
