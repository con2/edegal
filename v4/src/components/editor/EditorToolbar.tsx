import { SubmitButton } from "@con2/components";
import Link from "next/link";

import { sortPhotos } from "@/app/[locale]/[[...path]]/actions";
import type { Translations } from "@/translations";

export interface EditorRights {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface EditorToolbarProps {
  locale: string;
  albumId: string;
  albumPath: string;
  rights: EditorRights;
  hasPhotos: boolean;
  messages: Translations["Editor"];
}

/** Album management links shown in the breadcrumb bar for photographers with rights here. */
export function EditorToolbar({
  locale,
  albumId,
  albumPath,
  rights,
  hasPhotos,
  messages,
}: EditorToolbarProps) {
  const href = (param: string) => `${albumPath}?${param}=1`;
  return (
    <>
      {rights.canCreate ? (
        <Link className="btn btn-link btn-sm" href={href("new")}>
          {messages.newSubalbum}…
        </Link>
      ) : null}
      {rights.canEdit ? (
        <>
          <Link className="btn btn-link btn-sm" href={href("upload")}>
            {messages.uploadPhotos}…
          </Link>
          <Link className="btn btn-link btn-sm" href={href("edit")}>
            {messages.editAlbum}…
          </Link>
          {hasPhotos ? (
            <span className="d-inline-flex align-items-center">
              <span className="btn btn-link btn-sm disabled pe-1">
                {messages.sortPhotos}:
              </span>
              <form
                action={sortPhotos.bind(null, locale, albumId, "takenAt")}
                className="d-inline"
              >
                <SubmitButton variant="link" size="sm" className="btn-link">
                  {messages.sortByCaptureTime}
                </SubmitButton>
              </form>
              <form
                action={sortPhotos.bind(null, locale, albumId, "filename")}
                className="d-inline"
              >
                <SubmitButton variant="link" size="sm" className="btn-link">
                  {messages.sortByFilename}
                </SubmitButton>
              </form>
            </span>
          ) : null}
        </>
      ) : null}
      {rights.canDelete ? (
        <Link className="btn btn-link btn-sm text-danger" href={href("delete")}>
          {messages.deleteAlbum}…
        </Link>
      ) : null}
    </>
  );
}
