"use server";

import { normalizeFormData } from "@con2/components/helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { usableTermsId } from "@/editor/albums";
import { ensurePhotographer } from "@/editor/photographers";
import { PhotographerFormSchema, TermsFormSchema } from "@/editor/schemas";
import { getViewer, type Viewer } from "@/gallery/viewer";
import { db } from "@/prisma/db";

async function requirePhotographer(): Promise<Viewer & { kind: "user" }> {
  const viewer = await getViewer();
  if (viewer.kind !== "user" || !viewer.isPhotographer)
    throw new Error("photographer privileges required");
  return viewer;
}

function done(locale: string, code: string) {
  revalidatePath(`/${locale}/profile`);
  return void redirect(`/profile?success=${code}`);
}

export async function updatePhotographer(locale: string, formData: FormData) {
  const viewer = await requirePhotographer();
  const form = PhotographerFormSchema.parse(normalizeFormData(formData));
  // Checked against the existing row, not one `ensurePhotographer` might create below: creating
  // it first would mint a stray duplicate the moment someone types a slug that is already taken,
  // for instance a migrated profile's own slug before an admin has linked it to their account.
  const existing = await db.orm.public.Photographer.where({
    userId: viewer.userId,
  }).first();
  const slugOwner = await db.orm.public.Photographer.where({ slug: form.slug })
    .select("id")
    .first();
  if (slugOwner && slugOwner.id !== existing?.id) {
    revalidatePath(`/${locale}/profile`);
    return void redirect(`/profile?error=slugTaken`);
  }
  const photographer = existing ?? (await ensurePhotographer(viewer));
  await db.transaction(async (tx) => {
    await tx.orm.public.Photographer.where({ id: photographer.id }).update({
      displayName: form.displayName,
      slug: form.slug,
      visibility: form.visibility,
      email: form.email,
      introduction: form.introduction,
      defaultTermsId: await usableTermsId(
        viewer,
        form.defaultTermsId,
        photographer.defaultTermsId,
      ),
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
  return done(locale, "saved");
}

export async function clearProfilePhoto(locale: string) {
  const viewer = await requirePhotographer();
  await db.orm.public.Photographer.where({ userId: viewer.userId }).update({
    coverPhotoId: null,
  });
  revalidatePath(`/${locale}/photographers`);
  return done(locale, "photoCleared");
}

export async function createTerms(locale: string, formData: FormData) {
  const viewer = await requirePhotographer();
  const form = TermsFormSchema.parse(normalizeFormData(formData));
  await db.orm.public.Terms.create({ ...form, ownerId: viewer.userId });
  return done(locale, "termsSaved");
}

async function ownTerms(viewer: Viewer & { kind: "user" }, termsId: string) {
  const terms = await db.orm.public.Terms.where({ id: termsId }).first();
  if (!terms) throw new Error("terms not found");
  if (terms.ownerId !== viewer.userId && !viewer.isAdmin)
    throw new Error("not your terms");
  return terms;
}

export async function updateTerms(
  locale: string,
  termsId: string,
  formData: FormData,
) {
  const viewer = await requirePhotographer();
  await ownTerms(viewer, termsId);
  const form = TermsFormSchema.parse(normalizeFormData(formData));
  await db.orm.public.Terms.where({ id: termsId }).update(form);
  return done(locale, "termsSaved");
}

export async function deleteTerms(locale: string, termsId: string) {
  const viewer = await requirePhotographer();
  await ownTerms(viewer, termsId);
  // Albums without an owner (the root, whose terms are the site default) count as foreign use.
  const [albums, defaults] = await Promise.all([
    db.orm.public.Album.where({ termsId }).select("id", "ownerId").all(),
    db.orm.public.Photographer.where({ defaultTermsId: termsId })
      .select("userId")
      .all(),
  ]);
  const foreignUse =
    albums.some((a) => a.ownerId !== viewer.userId) ||
    defaults.some((p) => p.userId !== viewer.userId);
  if (foreignUse && !viewer.isAdmin) {
    revalidatePath(`/${locale}/profile`);
    return void redirect(`/profile?error=termsInUse`);
  }
  await db.orm.public.Terms.where({ id: termsId }).delete();
  return done(locale, "termsDeleted");
}
