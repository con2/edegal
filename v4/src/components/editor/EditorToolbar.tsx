import Link from "next/link";

import { sortPhotos } from "@/app/[locale]/[[...path]]/actions";
import type { Translations } from "@/translations";

import { SortPhotosMenu } from "./SortPhotosMenu";

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
  hasManualOrdering: boolean;
  messages: Translations["Editor"];
}

/** Album management links shown in the breadcrumb bar for photographers with rights here. */
export function EditorToolbar({
  locale,
  albumId,
  albumPath,
  rights,
  hasPhotos,
  hasManualOrdering,
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
            <SortPhotosMenu
              sortByCaptureTime={sortPhotos.bind(
                null,
                locale,
                albumId,
                "takenAt",
              )}
              sortByFilename={sortPhotos.bind(
                null,
                locale,
                albumId,
                "filename",
              )}
              current={hasManualOrdering ? "filename" : "takenAt"}
              messages={messages}
            />
          ) : null}
        </>
      ) : null}
      {rights.canDelete ? (
        <Link className="btn btn-link btn-sm ms-3" href={href("delete")}>
          {messages.deleteAlbum}…
        </Link>
      ) : null}
    </>
  );
}
