import { primary, type Reader, replica } from "@/prisma/reader";

import type { Viewer } from "./viewer";

/**
 * Anonymous viewers read the replica. Signed-in viewers read the primary: they are the only ones
 * who write, and the album cache is validated by `updated_at`, so a photographer must see the
 * bump their own upload just made.
 */
export function readerFor(viewer: Viewer): Reader {
  return viewer.kind === "anonymous" ? replica : primary;
}
