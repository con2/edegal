import { decodeBoolean } from "@con2/components/helpers";
import { z } from "zod";

/** Unchecked checkboxes send nothing; anything else goes through decodeBoolean. */
const checkbox = z.preprocess(
  (value) => decodeBoolean(String(value ?? "")),
  z.boolean(),
);

/** Absent for the root album, whose form has no slug field. */
const slug = z
  .string()
  .trim()
  .max(255)
  .regex(/^[a-z0-9-]*$/, "slug")
  .default("");

const uuid = z.string().uuid();

export const CreditsSchema = z.array(
  z.object({
    photographerId: uuid,
    isCopyright: z.boolean(),
    description: z.string().trim().max(255).default(""),
  }),
);
export type CreditInput = z.infer<typeof CreditsSchema>[number];

/** Hidden field carrying the CreditsEditor's rows as JSON. */
const creditsJson = z
  .string()
  .default("[]")
  .transform((text, ctx) => {
    try {
      return JSON.parse(text || "[]");
    } catch {
      ctx.addIssue({ code: "custom", message: "credits" });
      return z.NEVER;
    }
  })
  .pipe(CreditsSchema);

const eventMetadataUrl = z
  .string()
  .trim()
  .max(1023)
  .refine(
    (value) =>
      value === "" ||
      /^https:\/\/([a-z0-9-]+\.)*(kompassi\.eu|larpit\.fi)(\/|$)/.test(value),
    "eventMetadataUrl",
  )
  .default("");

export const AlbumFormSchema = z.object({
  title: z.string().trim().min(1).max(1023),
  slug,
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  visibility: z.enum(["public", "hidden", "private"]),
  isOpenForSubalbums: checkbox,
  isDownloadable: checkbox,
  ordering: z.coerce.number().int().min(-1_000_000).max(1_000_000).default(0),
  eventMetadataUrl,
  body: z.string().max(100_000).default(""),
  /** Empty string means "inherit from the parent". */
  termsId: z.union([uuid, z.literal("")]).default(""),
  credits: creditsJson,
  ownerId: z.union([uuid, z.literal("")]).optional(),
});
export type AlbumForm = z.infer<typeof AlbumFormSchema>;

export const LinksSchema = z.array(
  z.object({
    title: z.string().trim().min(1).max(255),
    href: z.string().trim().url().max(1023),
  }),
);

const linksJson = z
  .string()
  .default("[]")
  .transform((text, ctx) => {
    try {
      return JSON.parse(text || "[]");
    } catch {
      ctx.addIssue({ code: "custom", message: "links" });
      return z.NEVER;
    }
  })
  .pipe(LinksSchema);

export const PhotographerFormSchema = z.object({
  displayName: z.string().trim().min(1).max(255),
  email: z
    .union([z.string().trim().email().max(254), z.literal("")])
    .default(""),
  introduction: z.string().max(20_000).default(""),
  links: linksJson,
  defaultTermsId: z.union([uuid, z.literal("")]).default(""),
});

export const TermsFormSchema = z.object({
  title: z.string().trim().min(1).max(255),
  text: z.string().trim().min(1).max(20_000),
  url: z.union([z.string().trim().url().max(1023), z.literal("")]).default(""),
});

export const DeleteAlbumSchema = z.object({
  confirmSlug: z.string().trim(),
});
