"use server";

import { normalizeFormData } from "@con2/components/helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  albumSubtree,
  assertPathFree,
  assertSubtreePathsFree,
  childPath,
  deleteAlbumSubtree,
  deleteStorageKeys,
  moveAlbumPath,
  moveTargets,
  PathTakenError,
  photoStorageKeys,
  replaceCredits,
  slugForAlbum,
  sortPhotos as sortAlbumPhotos,
  type PhotoSort,
  usableTermsId,
  wouldCreateRedirectLoop,
} from "@/editor/albums";
import { ensurePhotographer } from "@/editor/photographers";
import { importFlickrAlbum as runFlickrImport } from "@/editor/importFlickr";
import {
  AlbumFormSchema,
  DeleteAlbumSchema,
  FlickrImportSchema,
  SeriesFormSchema,
} from "@/editor/schemas";
import {
  canCreateSubalbum,
  canDeleteAlbum,
  canEditAlbum,
  canList,
  canManagePhoto,
  canManageSeries,
} from "@/gallery/access";
import { invalidateAlbum } from "@/gallery/cache";
import { isAncestorOrSelf, parentPathOf } from "@/gallery/paths";
import { clearRedirect, recordMove } from "@/gallery/redirects";
import { touchAlbum, touchSeries, touchSubtree } from "@/gallery/touch";
import { getViewer, type Viewer } from "@/gallery/viewer";
import { albumJobCounts, pickAutoThumbnail } from "@/media/jobs";
import { db } from "@/prisma/db";

type SignedIn = Viewer & { kind: "user" };

async function requireUser(): Promise<SignedIn> {
  const viewer = await getViewer();
  if (viewer.kind !== "user") throw new Error("sign in required");
  return viewer;
}

async function requireAlbum(albumId: string) {
  const album = await db.orm.public.Album.where({ id: albumId }).first();
  if (!album) throw new Error("album not found");
  return album;
}

function withMessage(
  path: string,
  kind: "success" | "error",
  code: string,
): string {
  return `${path}?${kind}=${code}`;
}

async function requireSeriesId(seriesId: string): Promise<string | null> {
  if (!seriesId) return null;
  const series = await db.orm.public.Series.where({ id: seriesId })
    .select("id")
    .first();
  if (!series) throw new Error("series not found");
  return series.id;
}

/** Series pages list their members and link them to each other, so both sides go stale. */
async function touchSeriesMembership(
  ...seriesIds: (string | null | undefined)[]
): Promise<void> {
  for (const id of new Set(seriesIds))
    if (id) {
      await touchSeries(id);
      const series = await db.orm.public.Series.where({ id })
        .select("slug")
        .first();
      if (series) invalidateAlbum(`series:${series.slug}`);
    }
}

export async function createAlbum(
  locale: string,
  parentId: string,
  formData: FormData,
) {
  const viewer = await requireUser();
  const parent = await requireAlbum(parentId);
  if (
    !canCreateSubalbum(viewer, {
      ownerId: parent.ownerId,
      isOpenForSubalbums: parent.isOpenForSubalbums,
    })
  ) {
    throw new Error("not allowed to create a subalbum here");
  }
  const form = AlbumFormSchema.parse(normalizeFormData(formData));
  const slug = slugForAlbum(form.title, form.slug);
  const path = childPath(parent.path, slug);
  try {
    await assertPathFree(path);
  } catch (error) {
    if (error instanceof PathTakenError)
      return void redirect(
        withMessage(`${parent.path}`, "error", "pathTaken") + "&new=1",
      );
    throw error;
  }
  if (await wouldCreateRedirectLoop(path, form.redirectUrl))
    return void redirect(
      withMessage(`${parent.path}`, "error", "redirectLoop") + "&new=1",
    );
  const credits =
    form.credits.length > 0
      ? form.credits
      : [
          {
            photographerId: (await ensurePhotographer(viewer)).id,
            isCopyright: true,
            description: "",
          },
        ];
  const ownerId = viewer.isAdmin && form.ownerId ? form.ownerId : viewer.userId;

  const album = await db.orm.public.Album.create({
    parentId: parent.id,
    slug,
    path,
    title: form.title,
    body: form.body,
    visibility: form.visibility,
    layout: form.layout,
    isOpenForSubalbums: form.isOpenForSubalbums,
    isDownloadable: form.isDownloadable,
    ordering: form.ordering,
    eventDate: form.eventDate,
    eventMetadataUrl: form.eventMetadataUrl,
    termsId: await usableTermsId(viewer, form.termsId),
    ownerId,
    redirectUrl: form.redirectUrl,
    seriesId: await requireSeriesId(form.seriesId),
  });
  await replaceCredits(album.id, credits);
  await clearRedirect(path);
  await touchSeriesMembership(album.seriesId);
  await touchAlbum(album.id, parent.id);
  invalidateAlbum(album.id, parent.id);
  revalidatePath(`/${locale}${parent.path}`);
  return void redirect(withMessage(path, "success", "albumSaved"));
}

/** Creates a subalbum that links to a Flickr album; lands back on the parent, since the new album redirects. */
export async function importFlickrAlbum(
  locale: string,
  parentId: string,
  formData: FormData,
) {
  const viewer = await requireUser();
  const parent = await requireAlbum(parentId);
  if (
    !canCreateSubalbum(viewer, {
      ownerId: parent.ownerId,
      isOpenForSubalbums: parent.isOpenForSubalbums,
    })
  ) {
    throw new Error("not allowed to create a subalbum here");
  }
  const back = (code: string) =>
    redirect(withMessage(parent.path, "error", code) + "&importFlickr=1");
  const form = FlickrImportSchema.safeParse(normalizeFormData(formData));
  if (!form.success) return void back("invalid");
  const result = await runFlickrImport(
    viewer,
    { id: parent.id, path: parent.path },
    form.data,
  );
  if (!result.ok) return void back(result.error);
  revalidatePath(`/${locale}${parent.path}`);
  return void redirect(
    withMessage(
      parent.path,
      "success",
      result.coverImported ? "albumImported" : "albumImportedNoCover",
    ),
  );
}

export async function updateAlbum(
  locale: string,
  albumId: string,
  formData: FormData,
) {
  const viewer = await requireUser();
  const album = await requireAlbum(albumId);
  if (!canEditAlbum(viewer, { ownerId: album.ownerId }))
    throw new Error("not allowed to edit this album");
  const form = AlbumFormSchema.parse(normalizeFormData(formData));
  const isRoot = album.path === "/";
  const slug = isRoot ? "" : slugForAlbum(form.title, form.slug);
  // A new parent is accepted only from the same list the form offered, so the album cannot be
  // moved under itself or under an album the viewer may not add to.
  const currentParentPath = parentPathOf(album.path);
  const newParent =
    !isRoot && form.parentPath && form.parentPath !== currentParentPath
      ? ((await moveTargets(viewer, album)).find(
          (t) => t.path === form.parentPath,
        ) ?? null)
      : null;
  if (
    !isRoot &&
    form.parentPath &&
    form.parentPath !== currentParentPath &&
    !newParent
  )
    return void redirect(
      withMessage(album.path, "error", "invalidParent") + "&edit=1",
    );
  const parentPath = newParent?.path ?? currentParentPath;
  const path = isRoot ? "/" : childPath(parentPath, slug);
  try {
    await assertPathFree(path, album.id);
    await assertSubtreePathsFree(album.path, path);
  } catch (error) {
    if (error instanceof PathTakenError)
      return void redirect(
        withMessage(album.path, "error", "pathTaken") + "&edit=1",
      );
    throw error;
  }
  if (!isRoot && (await wouldCreateRedirectLoop(path, form.redirectUrl)))
    return void redirect(
      withMessage(album.path, "error", "redirectLoop") + "&edit=1",
    );

  await db.orm.public.Album.where({ id: album.id }).update({
    slug,
    title: form.title,
    body: form.body,
    visibility: form.visibility,
    layout: form.layout,
    isOpenForSubalbums: form.isOpenForSubalbums,
    isDownloadable: form.isDownloadable,
    ordering: form.ordering,
    eventDate: form.eventDate,
    eventMetadataUrl: form.eventMetadataUrl,
    termsId: await usableTermsId(viewer, form.termsId),
    ...(viewer.isAdmin && form.ownerId ? { ownerId: form.ownerId } : {}),
    ...(isRoot
      ? {}
      : {
          redirectUrl: form.redirectUrl,
          seriesId: await requireSeriesId(form.seriesId),
        }),
  });
  await replaceCredits(album.id, form.credits);
  await moveAlbumPath(album.id, album.path, path);
  if (!isRoot) await touchSeriesMembership(album.seriesId, form.seriesId);
  // Descendants inherit this album's visibility and, after a move, the new parent's.
  if (album.visibility !== form.visibility || newParent)
    await touchSubtree(path);
  if (newParent) {
    await db.orm.public.Album.where({ id: album.id }).update({
      parentId: newParent.id,
    });
    await touchAlbum(newParent.id);
    invalidateAlbum(newParent.id, null);
    revalidatePath(`/${locale}${newParent.path}`);
  }
  await touchAlbum(album.id, album.parentId);
  invalidateAlbum(album.id, album.parentId);
  revalidatePath(`/${locale}${album.path}`);
  return void redirect(withMessage(path, "success", "albumSaved"));
}

export async function deleteAlbum(
  locale: string,
  albumId: string,
  formData: FormData,
) {
  const viewer = await requireUser();
  const album = await requireAlbum(albumId);
  if (
    !canDeleteAlbum(viewer, {
      ownerId: album.ownerId,
      path: album.path,
    })
  )
    throw new Error("not allowed to delete this album");
  const { confirmSlug } = DeleteAlbumSchema.parse(normalizeFormData(formData));
  if (confirmSlug !== album.slug)
    return void redirect(
      withMessage(album.path, "error", "confirmMismatch") + "&delete=1",
    );
  // Open albums collect other photographers' subalbums; deleting those is theirs or an admin's call.
  const subtree = await albumSubtree(album.id, album.path);
  const foreign = subtree.some(
    (a) =>
      !canDeleteAlbum(viewer, {
        ownerId: a.ownerId,
        path: a.path,
      }),
  );
  if (foreign)
    return void redirect(
      withMessage(album.path, "error", "foreignSubalbums") + "&delete=1",
    );
  const parentPath = parentPathOf(album.path);
  const seriesIds = await db.orm.public.Album.where((a) =>
    a.id.in(subtree.map((s) => s.id)),
  )
    .select("seriesId")
    .all();
  await deleteAlbumSubtree(album.id, album.path);
  await touchSeriesMembership(...seriesIds.map((a) => a.seriesId));
  if (album.parentId) await touchAlbum(album.parentId);
  invalidateAlbum(album.id, album.parentId);
  revalidatePath(`/${locale}${parentPath}`);
  return void redirect(withMessage(parentPath, "success", "albumDeleted"));
}

export async function deletePhoto(locale: string, photoId: string) {
  const viewer = await requireUser();
  const photo = await db.orm.public.Photo.where({ id: photoId })
    .include("album")
    .first();
  if (!photo) throw new Error("photo not found");
  if (!canManagePhoto(viewer, { ownerId: photo.album.ownerId }))
    throw new Error("not allowed to delete this photo");
  const storageKeys = await photoStorageKeys(photo.id);
  await db.orm.public.Photo.where({ id: photo.id }).delete();
  await deleteStorageKeys(storageKeys);
  if (photo.album.thumbnailPhotoId === photo.id) {
    await db.orm.public.Album.where({ id: photo.albumId }).update({
      thumbnailPhotoId: await pickAutoThumbnail(photo.albumId),
      thumbnailIsAuto: true,
    });
  }
  await touchAlbum(photo.albumId, photo.album.parentId);
  invalidateAlbum(photo.albumId, photo.album.parentId);
  revalidatePath(`/${locale}${photo.album.path}`);
  return void redirect(
    withMessage(photo.album.path, "success", "photoDeleted"),
  );
}

/** Sets the thumbnail of the photo's own album or of any of its ancestors the viewer may edit. */
export async function setAlbumThumbnail(
  locale: string,
  albumId: string,
  photoId: string,
) {
  const viewer = await requireUser();
  const [photo, target] = await Promise.all([
    db.orm.public.Photo.where({ id: photoId }).include("album").first(),
    requireAlbum(albumId),
  ]);
  if (!photo) throw new Error("photo not found");
  if (!isAncestorOrSelf(target.path, photo.album.path))
    throw new Error("photo is not in this album or below it");
  if (!canEditAlbum(viewer, { ownerId: target.ownerId }))
    throw new Error("not allowed to edit this album");
  // The target's tile is as public as the target; the photo must be listable to the viewer.
  if (
    !canList(viewer, {
      visibility: photo.album.visibility,
      ownerId: photo.album.ownerId,
    })
  )
    throw new Error("not allowed to show this photo");
  await db.orm.public.Album.where({ id: target.id }).update({
    thumbnailPhotoId: photo.id,
    thumbnailIsAuto: false,
  });
  await touchAlbum(target.id, target.parentId);
  invalidateAlbum(target.id, target.parentId);
  revalidatePath(`/${locale}${target.path}`);
  revalidatePath(`/${locale}${photo.album.path}`);
}

export async function sortPhotos(
  locale: string,
  albumId: string,
  by: PhotoSort,
) {
  const viewer = await requireUser();
  const album = await requireAlbum(albumId);
  if (!canEditAlbum(viewer, { ownerId: album.ownerId }))
    throw new Error("not allowed to edit this album");
  await sortAlbumPhotos(album.id, by);
  await touchAlbum(album.id);
  invalidateAlbum(album.id, album.parentId);
  revalidatePath(`/${locale}${album.path}`);
  return void redirect(withMessage(album.path, "success", "photosSorted"));
}

/** Polled by the upload panel until the worker has processed everything. */
export async function albumProcessingStatus(albumId: string) {
  const viewer = await requireUser();
  const album = await requireAlbum(albumId);
  if (!canEditAlbum(viewer, { ownerId: album.ownerId }))
    throw new Error("not allowed");
  return albumJobCounts(album.id);
}

/**
 * Makes any v4 photo the signed-in photographer's profile photo. The photo need not be theirs,
 * but it must be one they may list, so a forged id cannot publish a hidden or private album's photo.
 */
export async function setProfilePhoto(locale: string, photoId: string) {
  const viewer = await getViewer();
  if (viewer.kind !== "user" || !viewer.isPhotographer)
    throw new Error("photographer privileges required");
  const photo = await db.orm.public.Photo.where({ id: photoId })
    .include("album")
    .first();
  if (
    !photo ||
    !canList(viewer, {
      visibility: photo.album.visibility,
      ownerId: photo.album.ownerId,
    })
  )
    throw new Error("photo not found");
  const photographer = await ensurePhotographer(viewer);
  await db.orm.public.Photographer.where({ id: photographer.id }).update({
    coverPhotoId: photo.id,
  });
  revalidatePath(`/${locale}/photographers`);
  revalidatePath(`/${locale}/photographers/${photographer.slug}`);
  revalidatePath(`/${locale}/profile`);
  redirect(`/profile?success=photoSet`);
}

function seriesRedirectTarget(slug: string): string {
  return `/${slug}`;
}

export async function createSeries(locale: string, formData: FormData) {
  const viewer = await requireUser();
  if (!canManageSeries(viewer)) throw new Error("admin privileges required");
  const form = SeriesFormSchema.parse(normalizeFormData(formData));
  const slug = slugForAlbum(form.title, form.slug);
  const path = seriesRedirectTarget(slug);
  try {
    await assertPathFree(path);
  } catch (error) {
    if (error instanceof PathTakenError)
      return void redirect(
        withMessage("/", "error", "pathTaken") + "&newSeries=1",
      );
    throw error;
  }
  await db.orm.public.Series.create({
    slug,
    path,
    title: form.title,
    description: form.description,
    body: form.body,
    visibility: form.visibility,
  });
  await clearRedirect(path);
  invalidateAlbum(`series:${slug}`);
  revalidatePath(`/${locale}${path}`);
  return void redirect(withMessage(path, "success", "seriesSaved"));
}

export async function updateSeries(
  locale: string,
  seriesId: string,
  formData: FormData,
) {
  const viewer = await requireUser();
  if (!canManageSeries(viewer)) throw new Error("admin privileges required");
  const series = await db.orm.public.Series.where({ id: seriesId }).first();
  if (!series) throw new Error("series not found");
  const form = SeriesFormSchema.parse(normalizeFormData(formData));
  const slug = slugForAlbum(form.title, form.slug);
  const path = seriesRedirectTarget(slug);
  if (slug !== series.slug) {
    try {
      await assertPathFree(path);
    } catch (error) {
      if (error instanceof PathTakenError)
        return void redirect(
          withMessage(series.path, "error", "pathTaken") + "&edit=1",
        );
      throw error;
    }
  }
  await db.transaction(async (tx) => {
    if (slug !== series.slug) await recordMove(tx, series.path, path);
    await tx.orm.public.Series.where({ id: series.id }).update({
      slug,
      path,
      title: form.title,
      description: form.description,
      body: form.body,
      visibility: form.visibility,
    });
  });
  await touchSeries(series.id);
  invalidateAlbum(`series:${series.slug}`);
  invalidateAlbum(`series:${slug}`);
  revalidatePath(`/${locale}${path}`);
  return void redirect(withMessage(path, "success", "seriesSaved"));
}

/** Members stay; they merely leave the series (the foreign key is SET NULL). */
export async function deleteSeries(
  locale: string,
  seriesId: string,
  formData: FormData,
) {
  const viewer = await requireUser();
  if (!canManageSeries(viewer)) throw new Error("admin privileges required");
  const series = await db.orm.public.Series.where({ id: seriesId }).first();
  if (!series) throw new Error("series not found");
  const { confirmSlug } = DeleteAlbumSchema.parse(normalizeFormData(formData));
  if (confirmSlug !== series.slug)
    return void redirect(
      withMessage(series.path, "error", "confirmMismatch") + "&delete=1",
    );
  await touchSeries(series.id);
  await db.orm.public.Series.where({ id: series.id }).delete();
  invalidateAlbum(`series:${series.slug}`);
  revalidatePath(`/${locale}/`);
  return void redirect(withMessage("/", "success", "seriesDeleted"));
}
