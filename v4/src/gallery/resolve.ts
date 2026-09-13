import { legacyEnabled } from "@/config";
import { pool } from "@/legacy/pool";
import { legacyProbeSql } from "@/legacy/sql";

import type { Resolution } from "./types";

type Kind =
  | "v4_photo"
  | "v4_album"
  | "v4_series"
  | "legacy_series"
  | "legacy_picture"
  | "legacy_album";

interface ProbeRow {
  kind: Kind;
  id: string;
  album_id: string | null;
}

const precedence: Kind[] = [
  "v4_photo",
  "v4_album",
  "v4_series",
  "legacy_series",
  "legacy_picture",
  "legacy_album",
];

const v4ProbeSql = `
  select 'v4_photo' as kind, id::text as id, album_id::text as album_id from v4_photo where path = $1
  union all
  select 'v4_album', id::text, id::text from v4_album where path = $1
  union all
  select 'v4_series', id::text, null::text from v4_series where path = $1
`;

const probeSql = legacyEnabled
  ? `${v4ProbeSql} union all ${legacyProbeSql}`
  : v4ProbeSql;

/**
 * One round trip over every `path` index. Precedence: v4 photo, v4 album, v4 series, legacy
 * series, legacy picture, legacy album (the spec's order, with series where Django checks them).
 */
export async function resolvePath(path: string): Promise<Resolution | null> {
  const { rows } = await pool.query<ProbeRow>(probeSql, [path]);
  const row = rows.sort(
    (a, b) => precedence.indexOf(a.kind) - precedence.indexOf(b.kind),
  )[0];
  if (!row) return null;
  switch (row.kind) {
    case "v4_photo":
      return {
        kind: "photo",
        source: "v4",
        albumId: row.album_id!,
        photoPath: path,
      };
    case "v4_album":
      return { kind: "album", source: "v4", albumId: row.id, albumPath: path };
    case "v4_series":
      return { kind: "series", source: "v4", seriesId: row.id, path };
    case "legacy_series":
      return { kind: "series", source: "legacy", seriesId: row.id, path };
    case "legacy_picture":
      return {
        kind: "photo",
        source: "legacy",
        albumId: row.album_id!,
        photoPath: path,
      };
    case "legacy_album":
      return {
        kind: "album",
        source: "legacy",
        albumId: row.id,
        albumPath: path,
      };
  }
}
