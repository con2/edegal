"use server";

import { normalizeFormData } from "@con2/components/helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { usableTermsId } from "@/editor/albums";
import {
  DifferentUsersError,
  linkPhotographerToUser,
  mergePhotographers,
  UserAlreadyLinkedError,
} from "@/editor/photographers";
import {
  ManagePhotographerFormSchema,
  MergePhotographersSchema,
} from "@/editor/schemas";
import { canManagePhotographers } from "@/gallery/access";
import { getViewer, type Viewer } from "@/gallery/viewer";
import { db } from "@/prisma/db";

async function requireAdmin(): Promise<Viewer & { kind: "user" }> {
  const viewer = await getViewer();
  if (viewer.kind !== "user" || !canManagePhotographers(viewer))
    throw new Error("admin privileges required");
  return viewer;
}

function revalidatePhotographer(locale: string, slug: string, id: string) {
  revalidatePath(`/${locale}/photographers`);
  revalidatePath(`/${locale}/photographers/${slug}`);
  revalidatePath(`/${locale}/manage/photographers`);
  revalidatePath(`/${locale}/manage/photographers/${id}`);
}

export async function updatePhotographerAsAdmin(
  locale: string,
  photographerId: string,
  formData: FormData,
) {
  const viewer = await requireAdmin();
  const photographer = await db.orm.public.Photographer.where({
    id: photographerId,
  }).first();
  if (!photographer) throw new Error("photographer not found");
  const form = ManagePhotographerFormSchema.parse(normalizeFormData(formData));
  const editHref = `/manage/photographers/${photographerId}`;

  const [slugOwner, userOwner] = await Promise.all([
    db.orm.public.Photographer.where({ slug: form.slug }).select("id").first(),
    form.userId
      ? db.orm.public.Photographer.where({ userId: form.userId })
          .select("id")
          .first()
      : Promise.resolve(null),
  ]);
  if (slugOwner && slugOwner.id !== photographer.id)
    return void redirect(`${editHref}?error=slugTaken`);
  if (userOwner && userOwner.id !== photographer.id)
    return void redirect(`${editHref}?error=userTaken`);

  await db.transaction(async (tx) => {
    await tx.orm.public.Photographer.where({ id: photographer.id }).update({
      displayName: form.displayName,
      slug: form.slug,
      visibility: form.visibility,
      email: form.email,
      introduction: form.introduction,
      defaultTermsId: await usableTermsId(viewer, form.defaultTermsId),
      userId: form.userId || null,
    });
    await tx.orm.public.PhotographerLink.where({
      photographerId: photographer.id,
    }).deleteAndCount();
    if (form.links.length > 0) {
      await tx.orm.public.PhotographerLink.createAll(
        form.links.map((link, index) => ({
          photographerId: photographer.id,
          href: link.href,
          title: link.title,
          ordering: index,
        })),
      );
    }
  });

  revalidatePhotographer(locale, form.slug, photographer.id);
  return void redirect(`${editHref}?success=saved`);
}

/** One-click link from the list, for the common case of a single email-matched account. */
export async function quickLinkPhotographer(
  locale: string,
  photographerId: string,
  userId: string,
) {
  await requireAdmin();
  try {
    await linkPhotographerToUser(photographerId, userId);
  } catch (error) {
    if (error instanceof UserAlreadyLinkedError) {
      return void redirect(`/manage/photographers?error=userTaken`);
    }
    throw error;
  }
  revalidatePath(`/${locale}/manage/photographers`);
  return void redirect(`/manage/photographers?success=saved`);
}

export async function mergePhotographersAction(
  locale: string,
  winnerId: string,
  formData: FormData,
) {
  await requireAdmin();
  const { loserId } = MergePhotographersSchema.parse(
    normalizeFormData(formData),
  );
  const editHref = `/manage/photographers/${winnerId}`;
  let result;
  try {
    result = await mergePhotographers(winnerId, loserId);
  } catch (error) {
    if (error instanceof DifferentUsersError)
      return void redirect(`${editHref}?error=differentUsers`);
    throw error;
  }
  revalidatePath(`/${locale}/photographers`);
  revalidatePath(`/${locale}/photographers/${result.winnerSlug}`);
  revalidatePath(`/${locale}/photographers/${result.loserSlug}`);
  revalidatePath(`/${locale}/manage/photographers`);
  revalidatePath(`/${locale}${editHref}`);
  return void redirect(`${editHref}?success=merged`);
}
