import Link from "next/link";

import { sortPhotos } from "@/app/[locale]/[[...path]]/actions";
import type { Translations } from "@/translations";

import { ImportAlbumMenu } from "./ImportAlbumMenu";
import { SortPhotosMenu } from "./SortPhotosMenu";

export interface EditorRights {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  /** Admins on the front page. */
  canCreateSeries: boolean;
}

interface EditorToolbarProps {
  locale: string;
  albumId: string;
  albumPath: string;
  /** Series pages have no photos or subalbums of their own, only edit and delete. */
  kind: "album" | "series";
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
  kind,
  rights,
  hasPhotos,
  hasManualOrdering,
  messages,
}: EditorToolbarProps) {
  const href = (param: string) => `${albumPath}?${param}=1`;
  return (
    <>
      {rights.canCreate ? (
        <>
          <Link className="btn btn-link btn-sm" href={href("new")}>
            {messages.newSubalbum}…
          </Link>
          <ImportAlbumMenu albumPath={albumPath} messages={messages} />
        </>
      ) : null}
      {rights.canCreateSeries ? (
        <Link className="btn btn-link btn-sm" href={href("newSeries")}>
          {messages.newSeries}…
        </Link>
      ) : null}
      {rights.canEdit ? (
        <>
          {kind === "album" ? (
            <Link className="btn btn-link btn-sm" href={href("upload")}>
              {messages.uploadPhotos}…
            </Link>
          ) : null}
          <Link className="btn btn-link btn-sm" href={href("edit")}>
            {kind === "series" ? messages.editSeries : messages.editAlbum}…
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
          {kind === "series" ? messages.deleteSeries : messages.deleteAlbum}…
        </Link>
      ) : null}
    </>
  );
}
