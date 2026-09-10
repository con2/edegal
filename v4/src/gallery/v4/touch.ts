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
