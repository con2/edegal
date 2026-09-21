import { pool } from "@/prisma/pool";

import { ancestorsPublicSql } from "./effectiveVisibility";

/** Photos in effectively public albums; anything under a hidden or private album is not sampled. */
export async function publicPhotoCount(): Promise<number> {
  const { rows } = await pool.query<{ n: string }>(
    `select count(*) as n from v4_photo p join v4_album a on a.id = p.album_id
     where a.visibility = 'public' and ${ancestorsPublicSql("a")}`,
  );
  return Number(rows[0]?.n ?? 0);
}

export async function randomPublicPhotoPath(): Promise<string | null> {
  const count = await publicPhotoCount();
  if (count === 0) return null;
  const { rows } = await pool.query<{ path: string }>(
    `select p.path from v4_photo p join v4_album a on a.id = p.album_id
     where a.visibility = 'public' and ${ancestorsPublicSql("a")}
     order by p.id offset $1 limit 1`,
    [Math.floor(Math.random() * count)],
  );
  return rows[0]?.path ?? null;
}
