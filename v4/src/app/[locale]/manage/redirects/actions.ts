"use server";

import { normalizeFormData } from "@con2/components/helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteRedirect, upsertRedirect } from "@/editor/manageRedirects";
import { DeleteRedirectSchema, RedirectFormSchema } from "@/editor/schemas";
import { canManageRedirects } from "@/gallery/access";
import { getViewer } from "@/gallery/viewer";

async function requireAdmin() {
  const viewer = await getViewer();
  if (!canManageRedirects(viewer)) throw new Error("admin privileges required");
}

export async function createRedirect(locale: string, formData: FormData) {
  await requireAdmin();
  const form = RedirectFormSchema.parse(normalizeFormData(formData));
  await upsertRedirect(form.fromPath, form.toPath);
  revalidatePath(`/${locale}/manage/redirects`);
  return void redirect(`/manage/redirects?success=saved`);
}

export async function deleteRedirectAction(locale: string, formData: FormData) {
  await requireAdmin();
  const { fromPath } = DeleteRedirectSchema.parse(normalizeFormData(formData));
  await deleteRedirect(fromPath);
  revalidatePath(`/${locale}/manage/redirects`);
  return void redirect(`/manage/redirects?success=deleted`);
}
