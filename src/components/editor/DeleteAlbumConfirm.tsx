import { SubmitButton } from "@con2/components";
import Link from "next/link";

import type { Translations } from "@/translations";

interface DeleteAlbumConfirmProps {
  action: (formData: FormData) => void | Promise<void>;
  album: { path: string; title: string; slug: string };
  /** Absent for a series, which deletes nothing but itself. */
  counts: { albums: number; photos: number } | null;
  texts: Translations["Editor"]["deleteConfirm"];
  messages: Translations["Editor"];
}

/** Typed-slug confirmation before deleting an album subtree or a series. */
export function DeleteAlbumConfirm({
  action,
  album,
  counts,
  texts: t,
  messages,
}: DeleteAlbumConfirmProps) {
  return (
    <div className="TextContent">
      <form action={action} className="container">
        <h2 className="mb-3">
          {t.title}: {album.title}
        </h2>
        <p className="text-danger fw-bold">{t.warning}</p>
        {counts ? (
          <p>
            {t.counts}: {counts.albums - 1} / {counts.photos}
          </p>
        ) : null}
        <div className="mb-3">
          <label className="form-label" htmlFor="DeleteAlbum-confirm">
            {t.typeSlug}: <code>{album.slug}</code>
          </label>
          <input
            className="form-control"
            id="DeleteAlbum-confirm"
            name="confirmSlug"
            type="text"
            required
            autoComplete="off"
            pattern={album.slug}
          />
        </div>
        <div className="d-flex gap-2 mb-3">
          <SubmitButton variant="danger">{t.confirm}</SubmitButton>
          <Link className="btn btn-outline-secondary" href={album.path}>
            {messages.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
