import { z } from "zod";

export const contactSubjects = ["permission", "takedown", "other"] as const;
export type ContactSubject = (typeof contactSubjects)[number];

export const ContactSchema = z.object({
  /** Path of the album or photo the message is about. */
  context: z.string().regex(/^\/[a-z0-9/-]*$/),
  email: z.string().trim().email().max(254),
  subject: z.enum(contactSubjects),
  message: z.string().trim().min(1).max(10_000),
});
export type ContactInput = z.infer<typeof ContactSchema>;
