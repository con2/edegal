/**
 * Prisma 8's TimestamptzString codec hands back PostgreSQL's text rendering
 * ("2026-09-10 19:59:34.726+03"), which is not ISO 8601. Normalise before parsing.
 */
export function pgTimestampToIso(value: string): string {
  const normalized = value
    .replace(" ", "T")
    .replace(/([+-]\d{2})$/, "$1:00")
    .replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  return new Date(normalized).toISOString();
}

export function yearOf(isoDate: string | null): string | null {
  return isoDate ? isoDate.slice(0, 4) : null;
}

/** Newest first; an unknown date (a migrated album with no discoverable date) sorts last. */
export function compareEventDateDesc(
  a: string | null,
  b: string | null,
): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? 1 : -1;
}
