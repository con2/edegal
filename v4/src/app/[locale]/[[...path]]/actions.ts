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
} from "@/editor/albums";
import { ensurePhotographer } from "@/editor/photographers";
import { AlbumFormSchema, DeleteAlbumSchema } from "@/editor/schemas";
import {
  canCreateSubalbum,
  canDeleteAlbum,
  canEditAlbum,
  canList,
  canManagePhoto,
} from "@/gallery/access";
import { invalidateAlbum } from "@/gallery/cache";
import { isAncestorOrSelf, parentPathOf } from "@/gallery/paths";
import { touchAlbum } from "@/gallery/v4/touch";
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

export async function createAlbum(
  locale: string,
  parentId: string,
  formData: FormData,
) {
  const viewer = await requireUser();
  const parent = await requireAlbum(parentId);
  if (
    !canCreateSubalbum(viewer, {
      source: "v4",
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
  });
  await replaceCredits(album.id, credits);
  await touchAlbum(album.id, parent.id);
  invalidateAlbum("v4", album.id, parent.id);
  revalidatePath(`/${locale}${parent.path}`);
  return void redirect(withMessage(path, "success", "albumSaved"));
}

export async function updateAlbum(
  locale: string,
  albumId: string,
  formData: FormData,
) {
  const viewer = await requireUser();
  const album = await requireAlbum(albumId);
  if (!canEditAlbum(viewer, { source: "v4", ownerId: album.ownerId }))
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
  });
  await replaceCredits(album.id, form.credits);
  await moveAlbumPath(album.id, album.path, path);
  if (newParent) {
    await db.orm.public.Album.where({ id: album.id }).update({
      parentId: newParent.id,
    });
    await touchAlbum(newParent.id);
    invalidateAlbum("v4", newParent.id, null);
    revalidatePath(`/${locale}${newParent.path}`);
  }
  await touchAlbum(album.id, album.parentId);
  invalidateAlbum("v4", album.id, album.parentId);
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
      source: "v4",
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
        source: "v4",
        ownerId: a.ownerId,
        path: a.path,
      }),
  );
  if (foreign)
    return void redirect(
      withMessage(album.path, "error", "foreignSubalbums") + "&delete=1",
    );
  const parentPath = parentPathOf(album.path);
  await deleteAlbumSubtree(album.id, album.path);
  if (album.parentId) await touchAlbum(album.parentId);
  invalidateAlbum("v4", album.id, album.parentId);
  revalidatePath(`/${locale}${parentPath}`);
  return void redirect(withMessage(parentPath, "success", "albumDeleted"));
}

export async function deletePhoto(locale: string, photoId: string) {
  const viewer = await requireUser();
  const photo = await db.orm.public.Photo.where({ id: photoId })
    .include("album")
    .first();
  if (!photo) throw new Error("photo not found");
  if (!canManagePhoto(viewer, { source: "v4", ownerId: photo.album.ownerId }))
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
  invalidateAlbum("v4", photo.albumId, photo.album.parentId);
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
  if (!canEditAlbum(viewer, { source: "v4", ownerId: target.ownerId }))
    throw new Error("not allowed to edit this album");
  // The target's tile is as public as the target; the photo must be listable to the viewer.
  if (
    !canList(viewer, {
      source: "v4",
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
  invalidateAlbum("v4", target.id, target.parentId);
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
  if (!canEditAlbum(viewer, { source: "v4", ownerId: album.ownerId }))
    throw new Error("not allowed to edit this album");
  await sortAlbumPhotos(album.id, by);
  await touchAlbum(album.id);
  invalidateAlbum("v4", album.id, album.parentId);
  revalidatePath(`/${locale}${album.path}`);
  return void redirect(withMessage(album.path, "success", "photosSorted"));
}

/** Polled by the upload panel until the worker has processed everything. */
export async function albumProcessingStatus(albumId: string) {
  const viewer = await requireUser();
  const album = await requireAlbum(albumId);
  if (!canEditAlbum(viewer, { source: "v4", ownerId: album.ownerId }))
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
      source: "v4",
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
