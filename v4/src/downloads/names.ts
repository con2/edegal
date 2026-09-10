import type { ClientAlbumPage, MediaFormat, PhotoVM } from "@/gallery/types";

const extensions: Record<MediaFormat, string> = {
  jpeg: "jpg",
  webp: "webp",
  avif: "avif",
  heif: "heif",
};

/** Flat entry names like the legacy zips: the photo slug plus the original's real extension. */
export function zipEntryName(photo: PhotoVM): string {
  const slug = photo.path.split("/").pop() ?? "photo";
  return `${slug}.${photo.original ? extensions[photo.original.format] : "jpg"}`;
}

export function zipFileName(album: Pick<ClientAlbumPage, "title">): string {
  const slug = album.title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "gallery"}.zip`;
}
