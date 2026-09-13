import { pool } from "@/legacy/pool";

/**
 * Bumps updated_at so every process (web and worker) sees the cached album page as stale. The
 * parent is bumped too when its listing (titles, thumbnails, child set) may have changed.
 */
export async function touchAlbum(
  albumId: string,
  parentId: string | null = null,
): Promise<void> {
  const ids = parentId ? [albumId, parentId] : [albumId];
  await pool.query(
    `update v4_album set updated_at = now() where id = any($1::uuid[])`,
    [ids],
  );
}

/**
 * Bumps a series and every album in it. Membership and dates decide each member's previous/next
 * links and the series listing, so all of their cached pages go stale together.
 */
export async function touchSeries(seriesId: string): Promise<void> {
  await pool.query(`update v4_series set updated_at = now() where id = $1`, [
    seriesId,
  ]);
  await pool.query(
    `update v4_album set updated_at = now() where series_id = $1`,
    [seriesId],
  );
}
