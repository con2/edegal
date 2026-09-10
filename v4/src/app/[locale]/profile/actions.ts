"use server";

import { normalizeFormData } from "@con2/components/helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  const photographer = await ensurePhotographer(viewer);
  await db.transaction(async (tx) => {
    await tx.orm.public.Photographer.where({ id: photographer.id }).update({
      displayName: form.displayName,
      email: form.email,
      introduction: form.introduction,
      defaultTermsId: form.defaultTermsId || null,
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
  const foreignUse = await db.orm.public.Album.where({ termsId })
    .where((a) => a.ownerId.neq(viewer.userId))
    .select("id")
    .first();
  if (foreignUse && !viewer.isAdmin) {
    revalidatePath(`/${locale}/profile`);
    return void redirect(`/profile?error=termsInUse`);
  }
  await db.orm.public.Terms.where({ id: termsId }).delete();
  return done(locale, "termsDeleted");
}
