import Link from "next/link";
import { Fragment } from "react";
import Container from "react-bootstrap/Container";

import type { ClientAlbumPage } from "@/gallery/types";
import type { Translations } from "@/translations";

import { breadcrumbSeparator, crumbTitle, fullBreadcrumb } from "./breadcrumb";

interface BreadcrumbBarProps {
  album: ClientAlbumPage;
  messages: {
    BreadcrumbBar: Translations["BreadcrumbBar"];
    Album: Translations["Album"];
  };
  canEdit: boolean;
}

export function BreadcrumbBar({
  album,
  messages,
  canEdit,
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
        {canEdit && album.legacyAdminUrl ? (
          <a className="btn btn-link btn-sm" href={album.legacyAdminUrl}>
            {messages.Album.editInLegacyAdmin}
          </a>
        ) : null}
      </nav>
    </Container>
  );
}
