import { pool } from "@/prisma/pool";

import type { Resolution } from "./types";

interface ProbeRow {
  kind: "v4_photo" | "v4_album" | "v4_series";
  id: string;
  album_id: string | null;
}

// A photo, album and series path are each unique within their own table, and assertPathFree
// keeps them from colliding across tables, so at most one row ever matches - the `order by` is
// just a defensive tie-break (photo, then album, then series) if that invariant is ever broken.
const probeSql = `
  select * from (
    select 'v4_photo' as kind, id::text as id, album_id::text as album_id, 1 as precedence from v4_photo where path = $1
    union all
    select 'v4_album', id::text, id::text, 2 from v4_album where path = $1
    union all
    select 'v4_series', id::text, null::text, 3 from v4_series where path = $1
  ) probe
  order by precedence
  limit 1
`;

/** One round trip over every `path` index. */
export async function resolvePath(path: string): Promise<Resolution | null> {
  const { rows } = await pool.query<ProbeRow>(probeSql, [path]);
  const row = rows[0];
  if (!row) return null;
  switch (row.kind) {
    case "v4_photo":
      return { kind: "photo", albumId: row.album_id!, photoPath: path };
    case "v4_album":
      return { kind: "album", albumId: row.id, albumPath: path };
    case "v4_series":
      return { kind: "series", seriesId: row.id, path };
  }
}
