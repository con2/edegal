import Link from "next/link";
import { Fragment } from "react";
import Container from "react-bootstrap/Container";

import type { ClientAlbumPage } from "@/gallery/types";
import type { Translations } from "@/translations";

import { breadcrumbSeparator, crumbTitle, fullBreadcrumb } from "./breadcrumb";
import { DownloadAlbumButton } from "./DownloadAlbumButton";

interface BreadcrumbBarProps {
  album: ClientAlbumPage;
  messages: Pick<
    Translations,
    "BreadcrumbBar" | "Album" | "DownloadAlbumDialog" | "Download"
  >;
  canEdit: boolean;
  canDownload: boolean;
}

export function BreadcrumbBar({
  album,
  messages,
  canEdit,
  canDownload,
}: BreadcrumbBarProps) {
  const crumbs = fullBreadcrumb(album, null, 1);
  return (
    <Container
      fluid
      className="BreadcrumbBar d-flex flex-column flex-sm-row justify-content-between"
    >
      <nav className="BreadcrumbBar-breadcrumb">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const separator = index > 0 ? breadcrumbSeparator : "";
          return (
            <Fragment key={crumb.path}>
              {separator}
              {isLast ? (
                crumbTitle(crumb, messages.BreadcrumbBar)
              ) : (
                <Link href={crumb.path}>
                  {crumbTitle(crumb, messages.BreadcrumbBar)}
                </Link>
              )}
            </Fragment>
          );
        })}
      </nav>
      <nav className="BreadcrumbBar-actions">
        {canDownload ? (
          <DownloadAlbumButton
            album={album}
            label={messages.BreadcrumbBar.downloadAlbumLink}
            messages={{
              DownloadAlbumDialog: messages.DownloadAlbumDialog,
              Download: messages.Download,
            }}
          />
        ) : null}
        {canEdit && album.legacyAdminUrl ? (
          <a className="btn btn-link btn-sm" href={album.legacyAdminUrl}>
            {messages.Album.editInLegacyAdmin}
          </a>
        ) : null}
      </nav>
    </Container>
  );
}
