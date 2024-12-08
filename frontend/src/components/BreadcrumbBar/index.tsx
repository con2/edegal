"use client";

import React from "react";

import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

import { getCached } from "../../services/getAlbum";
import Album from "../../models/Album";
import DownloadDialog, { useDialogState } from "../DownloadDialog";

import "./index.scss";
import {
  breadcrumbSeparator,
  getBreadcrumbTitle,
  getFullBreadcrumb,
} from "../../helpers/breadcrumb";
import ContactDialog from "../ContactDialog";
import Link from "next/link";
import type { Translations } from "@/translations/en";

const downloadAlbumPollingDelay = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface Props {
  album: Album;
  messages: {
    BreadcrumbBar: Translations["BreadcrumbBar"];
    ContactDialog: Translations["ContactDialog"];
    DownloadAlbumDialog: Translations["DownloadAlbumDialog"];
  };
}

export default function BreadcrumbBar({ album, messages }: Props) {
  const t = messages.BreadcrumbBar;
  const fullBreadcrumb = React.useMemo(
    () => getFullBreadcrumb(album, undefined, 1),
    [album]
  );
  const canDownload = album.is_downloadable && album.pictures.length;
  const isPhotographerLinkShown =
    album.credits.photographer &&
    album.credits.photographer.path !== album.path;

  const [isDownloadPreparing, setDownloadPreparing] = React.useState(false);
  const {
    isDialogOpen: isDownloadDialogOpen,
    openDialog: openDownloadDialog,
    closeDialog: closeDownloadDialog,
  } = useDialogState();
  const {
    isDialogOpen: isContactDialogOpen,
    openDialog: openContactDialog,
    closeDialog: closeContactDialog,
  } = useDialogState();

  const downloadAlbum = React.useCallback(async () => {
    let downloadableAlbum = album;
    if (!album.download_url) {
      // Zip not yet created
      setDownloadPreparing(true);

      // Trigger zip creation
      downloadableAlbum = await getCached(album.path, true, true);

      // Poll for zip creation to finish
      while (!downloadableAlbum.download_url) {
        await sleep(downloadAlbumPollingDelay);
        downloadableAlbum = await getCached(album.path, true);
      }
    }

    setDownloadPreparing(false);
    window.location.href = downloadableAlbum.download_url;
  }, [album]);

  const handleContactPhotographer = React.useCallback(() => {
    closeDownloadDialog();
    openContactDialog();
  }, []);

  return (
    <Container
      fluid
      className="BreadcrumbBar d-flex flex-column flex-sm-row justify-content-between"
    >
      <nav className="BreadcrumbBar-breadcrumb">
        {fullBreadcrumb.map((item, index) => {
          const isActive = index === fullBreadcrumb.length - 1;
          const content = getBreadcrumbTitle(item, t);
          const separator = index > 0 ? breadcrumbSeparator : "";
          if (isActive) {
            return (
              <React.Fragment key={item.path}>
                {separator} {content}
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={item.path}>
                {separator}
                <Link key={item.path} href={item.path}>
                  {content}
                </Link>
              </React.Fragment>
            );
          }
        })}
      </nav>
      <nav className="BreadcrumbBar-actions">
        {canDownload ? (
          <Button variant="link" size="sm" onClick={openDownloadDialog}>
            {/* <svg className="BreadcrumbBar-icon">
              <use xlinkHref={`${editorIcons}#ic_vertical_align_bottom_24px`} />
            </svg> */}
            💾 {t.downloadAlbumLink}…
          </Button>
        ) : null}
        {/* FIXME why does this need `as any`? it works */}
        {isPhotographerLinkShown ? (
          <Button
            as={Link as any}
            href={album.credits.photographer!.path}
            variant="link"
            size="sm"
          >
            {/* <svg className="BreadcrumbBar-icon">
              <use xlinkHref={`${socialIcons}#ic_person_24px`} />
            </svg> */}
            👤 {t.aboutPhotographerLink}
          </Button>
        ) : null}
      </nav>

      <DownloadDialog
        key={album.path + "/download"}
        album={album}
        onAccept={downloadAlbum}
        onClose={closeDownloadDialog}
        onContactPhotographer={handleContactPhotographer}
        isOpen={isDownloadDialogOpen}
        isPreparing={isDownloadPreparing}
        messages={messages.DownloadAlbumDialog}
      />

      <ContactDialog
        key={album.path + "/contact"}
        onClose={closeContactDialog}
        isOpen={isContactDialogOpen}
        album={album}
        messages={messages.ContactDialog}
      />
    </Container>
  );
}
