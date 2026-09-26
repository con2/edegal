import "dotenv/config";

import { moveTopLevelPhotosToPhotographerAlbums } from "@/editor/topLevelPhotos";
import { db } from "@/prisma/db";
import { pool } from "@/prisma/pool";

/**
 * Files photos found directly in a top-level album under a subalbum named after the album's
 * credited photographers (Larppikuvat.fi convention: one album per larp, photos in
 * per-photographer subalbums):
 *
 *   npm run photos:move-top-level              dry run, reports what would change
 *   npm run photos:move-top-level -- --apply   create the subalbums and move the photos
 */
const apply = process.argv.slice(2).includes("--apply");

const tally = await moveTopLevelPhotosToPhotographerAlbums({
  apply,
  log: (line) => console.log(line),
});

console.log(
  `${apply ? "applied" : "dry run"}:`,
  JSON.stringify(tally, null, 2),
);
await db.close();
await pool.end();
