import { albumSubtree } from "@/editor/albums";
import {
  albumFormOptions,
  existingAlbumValues,
  newAlbumDefaults,
} from "@/editor/formData";
import {
  canCreateSubalbum,
  canDeleteAlbum,
  canEditAlbum,
} from "@/gallery/access";
import type { AlbumPageVM } from "@/gallery/types";
import type { Viewer } from "@/gallery/viewer";
import { db } from "@/prisma/db";
import type { Translations } from "@/translations";

import {
  albumProcessingStatus,
  createAlbum,
  deleteAlbum,
  updateAlbum,
} from "@/app/[locale]/[[...path]]/actions";

import { AlbumForm } from "./AlbumForm";
import { DeleteAlbumConfirm } from "./DeleteAlbumConfirm";
import { UploadPanel } from "./UploadPanel";

export type EditorMode = "new" | "edit" | "upload" | "delete";

export function editorMode(
  searchParams: Record<string, string | string[] | undefined>,
): EditorMode | null {
  for (const mode of ["new", "edit", "upload", "delete"] as const) {
    if (searchParams[mode] !== undefined) return mode;
  }
  return null;
}

interface EditorPanelProps {
  mode: EditorMode;
  locale: string;
  album: AlbumPageVM;
  viewer: Viewer;
  messages: Pick<Translations, "Editor" | "Upload">;
}

/** The editor view chosen by the URL, or nothing when the viewer lacks the right for it. */
export async function EditorPanel({
  mode,
  locale,
  album,
  viewer,
  messages,
}: EditorPanelProps) {
  if (viewer.kind !== "user" || album.source !== "v4") return null;
  const guard = {
    source: album.source,
    ownerId: album.ownerId,
    isOpenForSubalbums: album.isOpenForSubalbums,
    path: album.path,
  };

  if (mode === "new") {
    if (!canCreateSubalbum(viewer, guard)) return null;
    const defaults = await newAlbumDefaults(viewer);
    return (
      <AlbumForm
        locale={locale}
        action={createAlbum.bind(null, locale, album.id)}
        heading={messages.Editor.newAlbumTitle}
        submitLabel={messages.Editor.create}
        cancelHref={album.path}
        values={defaults.values}
        credits={defaults.credits}
        options={await albumFormOptions(
          viewer,
          `${album.path === "/" ? "" : album.path}/new`,
          null,
        )}
        isRoot={false}
        messages={messages.Editor}
      />
    );
  }

  if (!canEditAlbum(viewer, guard)) return null;

  if (mode === "edit") {
    const existing = await existingAlbumValues(album.id);
    if (!existing) return null;
    return (
      <AlbumForm
        locale={locale}
        action={updateAlbum.bind(null, locale, album.id)}
        heading={messages.Editor.editAlbumTitle}
        submitLabel={messages.Editor.save}
        cancelHref={album.path}
        values={existing.values}
        credits={existing.credits}
        options={await albumFormOptions(
          viewer,
          album.path,
          existing.values.termsId || null,
        )}
        isRoot={album.path === "/"}
        messages={messages.Editor}
      />
    );
  }

  if (mode === "upload") {
    return (
      <UploadPanel
        albumId={album.id}
        processing={album.photosProcessing}
        status={albumProcessingStatus.bind(null, album.id)}
        messages={messages.Upload}
      />
    );
  }

  if (!canDeleteAlbum(viewer, guard)) return null;
  const subtree = await albumSubtree(album.id, album.path);
  const photos = await db.orm.public.Photo.where((p) =>
    p.albumId.in(subtree.map((a) => a.id)),
  ).aggregate((a) => ({ n: a.count() }));
  const row = await db.orm.public.Album.where({ id: album.id })
    .select("slug")
    .first();
  return (
    <DeleteAlbumConfirm
      action={deleteAlbum.bind(null, locale, album.id)}
      album={{ path: album.path, title: album.title, slug: row?.slug ?? "" }}
      counts={{ albums: subtree.length, photos: photos.n }}
      messages={messages.Editor}
    />
  );
}
