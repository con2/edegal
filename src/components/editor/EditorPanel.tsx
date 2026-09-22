import { albumSubtree } from "@/editor/albums";
import {
  albumFormOptions,
  existingAlbumValues,
  existingSeriesValues,
  newAlbumDefaults,
  newSeriesValues,
} from "@/editor/formData";
import {
  canCreateSubalbum,
  canDeleteAlbum,
  canEditAlbum,
  canManagePhotographers,
  canManageSeries,
} from "@/gallery/access";
import type { AlbumPageVM } from "@/gallery/types";
import type { Viewer } from "@/gallery/viewer";
import { db } from "@/prisma/db";
import type { Translations } from "@/translations";

import {
  albumProcessingStatus,
  createAlbum,
  createSeries,
  deleteAlbum,
  deleteSeries,
  importFlickrAlbum,
  updateAlbum,
  updatePhotographersIntro,
  updateSeries,
} from "@/app/[locale]/[[...path]]/actions";

import { AlbumForm } from "./AlbumForm";
import { DeleteAlbumConfirm } from "./DeleteAlbumConfirm";
import { FlickrImportForm } from "./FlickrImportForm";
import { PhotographersIntroForm } from "./PhotographersIntroForm";
import { SeriesForm } from "./SeriesForm";
import { UploadPanel } from "./UploadPanel";

export type EditorMode =
  "new" | "edit" | "upload" | "delete" | "newSeries" | "importFlickr";

export function editorMode(
  searchParams: Record<string, string | string[] | undefined>,
): EditorMode | null {
  for (const mode of [
    "new",
    "edit",
    "upload",
    "delete",
    "newSeries",
    "importFlickr",
  ] as const) {
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
  if (viewer.kind !== "user") return null;
  if (album.kind === "series")
    return (
      <SeriesEditorPanel
        mode={mode}
        locale={locale}
        series={album}
        viewer={viewer}
        messages={messages.Editor}
      />
    );
  if (album.kind === "photographers") {
    if (mode !== "edit" || !canManagePhotographers(viewer)) return null;
    return (
      <PhotographersIntroForm
        locale={locale}
        action={updatePhotographersIntro.bind(null, locale)}
        body={album.body}
        cancelHref={album.path}
        messages={messages.Editor}
      />
    );
  }
  if (album.kind !== "album") return null;
  const guard = {
    ownerId: album.ownerId,
    isOpenForSubalbums: album.isOpenForSubalbums,
    path: album.path,
  };

  if (mode === "newSeries") {
    if (album.path !== "/" || !canManageSeries(viewer)) return null;
    return (
      <SeriesForm
        locale={locale}
        action={createSeries.bind(null, locale)}
        heading={messages.Editor.newSeriesTitle}
        submitLabel={messages.Editor.createSeries}
        cancelHref="/"
        values={newSeriesValues}
        messages={messages.Editor}
      />
    );
  }

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
        parent={{ path: album.path, title: album.title }}
        messages={messages.Editor}
      />
    );
  }

  if (mode === "importFlickr") {
    if (!canCreateSubalbum(viewer, guard)) return null;
    return (
      <FlickrImportForm
        action={importFlickrAlbum.bind(null, locale, album.id)}
        cancelHref={album.path}
        parent={{ path: album.path, title: album.title }}
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
          album.path === "/" ? null : { id: album.id, path: album.path },
        )}
        isRoot={album.path === "/"}
        parent={null}
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
      texts={messages.Editor.deleteConfirm}
      messages={messages.Editor}
    />
  );
}

async function SeriesEditorPanel({
  mode,
  locale,
  series,
  viewer,
  messages,
}: {
  mode: EditorMode;
  locale: string;
  series: AlbumPageVM;
  viewer: Viewer;
  messages: Translations["Editor"];
}) {
  if (!canManageSeries(viewer)) return null;
  if (mode === "edit") {
    const values = await existingSeriesValues(series.id);
    if (!values) return null;
    return (
      <SeriesForm
        locale={locale}
        action={updateSeries.bind(null, locale, series.id)}
        heading={messages.editSeriesTitle}
        submitLabel={messages.save}
        cancelHref={series.path}
        values={values}
        messages={messages}
      />
    );
  }
  if (mode === "delete") {
    const values = await existingSeriesValues(series.id);
    if (!values) return null;
    return (
      <DeleteAlbumConfirm
        action={deleteSeries.bind(null, locale, series.id)}
        album={{ path: series.path, title: series.title, slug: values.slug }}
        counts={null}
        texts={messages.deleteSeriesConfirm}
        messages={messages}
      />
    );
  }
  return null;
}
