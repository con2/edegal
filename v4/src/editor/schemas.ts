import { decodeBoolean } from "@con2/components/helpers";
import { z } from "zod";

import { isFlickrUrl } from "@/importers/flickr";

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

/** Empty, an absolute http(s) URL, or a gallery path such as /desucon-2026. */
const redirectUrl = z
  .string()
  .trim()
  .max(1023)
  .refine(
    (value) =>
      value === "" ||
      /^https?:\/\/\S+$/.test(value) ||
      /^\/[a-z0-9/-]*$/.test(value),
    "redirectUrl",
  )
  .default("");

export const AlbumFormSchema = z.object({
  title: z.string().trim().min(1).max(1023),
  slug,
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  visibility: z.enum(["public", "hidden", "private"]),
  layout: z.enum(["simple", "yearly"]).default("simple"),
  /** Path of the parent to move the album under; empty or unchanged keeps the current parent. */
  parentPath: z.string().trim().max(1023).default(""),
  isOpenForSubalbums: checkbox,
  isDownloadable: checkbox,
  ordering: z.coerce.number().int().min(-1_000_000).max(1_000_000).default(0),
  eventMetadataUrl,
  body: z.string().max(100_000).default(""),
  /** Empty string means "inherit from the parent". */
  termsId: z.union([uuid, z.literal("")]).default(""),
  credits: creditsJson,
  ownerId: z.union([uuid, z.literal("")]).optional(),
  redirectUrl,
  /** Empty string means "not part of a series". */
  seriesId: z.union([uuid, z.literal("")]).default(""),
});
export type AlbumForm = z.infer<typeof AlbumFormSchema>;

export const SeriesFormSchema = z.object({
  title: z.string().trim().min(1).max(1023),
  slug: z
    .string()
    .trim()
    .max(255)
    .regex(/^[a-z0-9-]*$/, "slug")
    .default(""),
  description: z.string().trim().max(2000).default(""),
  visibility: z.enum(["public", "hidden", "private"]),
  body: z.string().max(100_000).default(""),
});
export type SeriesForm = z.infer<typeof SeriesFormSchema>;

export const FlickrImportSchema = z.object({
  flickrUrl: z.string().trim().max(1023).refine(isFlickrUrl, "flickrUrl"),
  title: z.string().trim().max(1023).default(""),
  visibility: z.enum(["public", "hidden", "private"]),
});

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
  slug: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "slug"),
  visibility: z.enum(["public", "hidden", "private"]),
  email: z
    .union([z.string().trim().email().max(254), z.literal("")])
    .default(""),
  introduction: z.string().max(20_000).default(""),
  links: linksJson,
  defaultTermsId: z.union([uuid, z.literal("")]).default(""),
});

/** Empty string means "not linked to any account". */
export const ManagePhotographerFormSchema = PhotographerFormSchema.extend({
  userId: z.union([uuid, z.literal("")]).default(""),
});

export const MergePhotographersSchema = z.object({
  loserId: uuid,
});

export const PhotographersIntroSchema = z.object({
  body: z.string().max(100_000).default(""),
});

export const TermsFormSchema = z.object({
  title: z.string().trim().min(1).max(255),
  text: z.string().trim().min(1).max(20_000),
  url: z.union([z.string().trim().url().max(1023), z.literal("")]).default(""),
});

export const DeleteAlbumSchema = z.object({
  confirmSlug: z.string().trim(),
});

export const RedirectFormSchema = z.object({
  /** Replaces any existing redirect from this path, so this doubles as "edit". */
  fromPath: z
    .string()
    .trim()
    .max(1023)
    .regex(/^\/[a-z0-9/-]+$/, "fromPath"),
  toPath: z
    .string()
    .trim()
    .max(1023)
    .refine(
      (value) =>
        /^https?:\/\/\S+$/.test(value) || /^\/[a-z0-9/-]+$/.test(value),
      "toPath",
    ),
});

export const DeleteRedirectSchema = z.object({
  fromPath: z.string().trim().max(1023),
});
