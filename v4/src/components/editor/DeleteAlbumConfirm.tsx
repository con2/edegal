import { SubmitButton } from "@con2/components";
import Link from "next/link";

import type { Translations } from "@/translations";

interface DeleteAlbumConfirmProps {
  action: (formData: FormData) => void | Promise<void>;
  album: { path: string; title: string; slug: string };
  counts: { albums: number; photos: number };
  messages: Translations["Editor"];
}

export function DeleteAlbumConfirm({
  action,
  album,
  counts,
  messages,
}: DeleteAlbumConfirmProps) {
  const t = messages.deleteConfirm;
  return (
    <div className="TextContent">
      <form action={action} className="container">
        <h2 className="mb-3">
          {t.title}: {album.title}
        </h2>
        <p className="text-danger fw-bold">{t.warning}</p>
        <p>
          {t.counts}: {counts.albums - 1} / {counts.photos}
        </p>
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
