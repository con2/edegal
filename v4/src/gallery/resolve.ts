import { pool } from "@/prisma/pool";

import type { Resolution } from "./types";

type Kind = "v4_photo" | "v4_album" | "v4_series";

interface ProbeRow {
  kind: Kind;
  id: string;
  album_id: string | null;
}

const precedence: Kind[] = ["v4_photo", "v4_album", "v4_series"];

const probeSql = `
  select 'v4_photo' as kind, id::text as id, album_id::text as album_id from v4_photo where path = $1
  union all
  select 'v4_album', id::text, id::text from v4_album where path = $1
  union all
  select 'v4_series', id::text, null::text from v4_series where path = $1
`;

/** One round trip over every `path` index. Precedence: photo, album, series. */
export async function resolvePath(path: string): Promise<Resolution | null> {
  const { rows } = await pool.query<ProbeRow>(probeSql, [path]);
  const row = rows.sort(
    (a, b) => precedence.indexOf(a.kind) - precedence.indexOf(b.kind),
  )[0];
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
