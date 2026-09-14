import { publicUrl } from "@/config";
import { loadGalleryPage } from "@/gallery/load";
import { resolvePath } from "@/gallery/resolve";
import type { Viewer } from "@/gallery/viewer";
import { legacyAlbumPhotographerEmail } from "@/legacy/sql";
import { db } from "@/prisma/db";

import { MailNotConfiguredError, sendMail } from "./mail";

import { type ContactInput, type ContactSubject } from "./schema";

/** Subject lines are for the photographer, who may not share the sender's language; English as in legacy. */
const subjectTitles: Record<ContactSubject, string> = {
  permission: "Usage permission inquiry",
  takedown: "Takedown request",
  other: "Contact request",
};

export function contactEmail(
  input: ContactInput,
  siteName: string,
): { subject: string; text: string } {
  const title = subjectTitles[input.subject];
  return {
    subject: `[${siteName}] ${title} (${input.context})`,
    text: [
      `Someone has reached out to you through the contact form on ${siteName}.`,
      "If you reply to this email, your response will be sent to the sender.",
      "",
      "Context (album or picture):",
      `${publicUrl}${input.context}`,
      "",
      "Sender email:",
      input.email,
      "",
      "Subject:",
      title,
      "",
      "Message:",
      "",
      input.message,
      "",
    ].join("\n"),
  };
}

export interface ContactRecipients {
  siteName: string;
  /** Addresses of the copyright holders who have given one. */
  to: string[];
}

/**
 * Who a message about this path goes to, or null when the viewer may not see the path or nobody
 * there has a contact address. Series and photographer pages are not about anyone's photos.
 */
export async function contactRecipients(
  path: string,
  viewer: Viewer,
): Promise<ContactRecipients | null> {
  const page = await loadGalleryPage(path, viewer);
  if (page.kind !== "ok" || page.unfiltered.kind !== "album") return null;
  const resolution = await resolvePath(path);
  if (!resolution || resolution.kind === "series") return null;
  const siteName =
    page.unfiltered.breadcrumb[0]?.title ?? page.unfiltered.title;

  let to: string[];
  if (resolution.source === "v4") {
    const credits = await db.orm.public.AlbumCredit.where({
      albumId: resolution.albumId,
      isCopyright: true,
    })
      .include("photographer")
      .all();
    to = credits
      .map((c) => c.photographer.email)
      .filter((email) => email !== "");
  } else {
    const email = await legacyAlbumPhotographerEmail(
      Number(resolution.albumId),
    );
    to = email ? [email] : [];
  }
  return to.length > 0 ? { siteName, to: [...new Set(to)] } : null;
}

export type ContactResult = "sent" | "noRecipient" | "unavailable";

export async function sendContactMessage(
  input: ContactInput,
  viewer: Viewer,
): Promise<ContactResult> {
  const recipients = await contactRecipients(input.context, viewer);
  if (!recipients) return "noRecipient";
  const mail = contactEmail(input, recipients.siteName);
  try {
    await sendMail({ to: recipients.to, replyTo: input.email, ...mail });
  } catch (error) {
    if (error instanceof MailNotConfiguredError) return "unavailable";
    throw error;
  }
  return "sent";
}
