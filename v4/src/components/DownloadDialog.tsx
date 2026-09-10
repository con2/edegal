"use client";

import { Markdown } from "@con2/components";
import { useState } from "react";
import Modal from "react-bootstrap/Modal";

import {
  creditLines,
  type Platform,
  platformsWithHandles,
} from "@/downloads/credits";
import { zipEntryName, zipFileName } from "@/downloads/names";
import type { ClientAlbumPage, PhotoVM } from "@/gallery/types";
import type { Translations } from "@/translations";

import { Linebreaks } from "./Linebreaks";

export type DownloadDialogMessages = Translations["DownloadDialog"];

interface DownloadDialogProps {
  album: ClientAlbumPage;
  /** The photo whose original is offered; null offers the whole album as a zip. */
  photo: PhotoVM | null;
  show: boolean;
  onHide(): void;
  messages: {
    dialog: DownloadDialogMessages;
    Download: Translations["Download"];
  };
}

const platformHeading: Record<Platform, keyof DownloadDialogMessages> = {
  twitter: "twitterCredit",
  instagram: "instagramCredit",
  threads: "threadsCredit",
  bluesky: "blueskyCredit",
};

/** Saves a same-origin file instead of navigating to it. */
function saveFile(href: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Shows the conditions of use and credit instructions, and gates the download behind an explicit
 * acceptance. Terms are not enforced server-side, matching the legacy behaviour.
 */
export function DownloadDialog({
  album,
  photo,
  show,
  onHide,
  messages,
}: DownloadDialogProps) {
  const t = messages.dialog;
  const [accepted, setAccepted] = useState(false);
  const platforms = platformsWithHandles(album.credits);
  const photographerLinks = album.credits.flatMap((c) =>
    c.links.map((l) => ({ ...l, who: c.displayName })),
  );

  const close = () => {
    setAccepted(false);
    onHide();
  };

  const accept = () => {
    if (photo?.original) {
      saveFile(photo.original.src, zipEntryName(photo));
    } else {
      saveFile(`/api/zip${album.path}`, zipFileName(album));
    }
    close();
  };

  return (
    <Modal show={show} onHide={close} className="DownloadDialog">
      <Modal.Header closeButton>
        <Modal.Title>{t.dialogTitle}</Modal.Title>
      </Modal.Header>

      <div className="modal-body">
        <p>
          <strong>{t.termsAndConditions}</strong>
        </p>
        {album.terms ? (
          album.terms.kind === "markdown" ? (
            <Markdown input={album.terms.text} />
          ) : (
            <Linebreaks text={album.terms.text} />
          )
        ) : (
          <p>{t.defaultTerms}</p>
        )}
        {album.terms?.url ? (
          <p>
            <a href={album.terms.url} target="_blank" rel="noopener noreferrer">
              {messages.Download.termsUrl}
            </a>
          </p>
        ) : null}

        {platforms.map((platform) => (
          <div key={platform}>
            <p>
              <strong>{t[platformHeading[platform]]}</strong>
            </p>
            <p>
              {creditLines(album.credits, platform).map((line) => (
                <span key={line.displayName}>
                  {line.isCopyright
                    ? t.photographer
                    : line.description || t.photographer}
                  : {line.handle ? `@${line.handle}` : line.displayName}
                  <br />
                </span>
              ))}
            </p>
          </div>
        ))}

        {album.credits.length > 0 ? (
          <>
            <p>
              <strong>
                {platforms.length > 0
                  ? t.genericCredit
                  : t.genericCreditAlternative}
              </strong>
            </p>
            <p>
              {creditLines(album.credits, null).map((line) => (
                <span key={line.displayName}>
                  {line.isCopyright
                    ? t.photographer
                    : line.description || t.photographer}
                  : {line.displayName}
                  <br />
                </span>
              ))}
            </p>
          </>
        ) : null}
      </div>

      <div className="modal-footer">
        <div className="d-flex w-100 justify-content-between">
          <label className="mt-2 d-block">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
            />{" "}
            {t.acceptTermsAndConditions}
          </label>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!accepted}
            onClick={accept}
          >
            {t.downloadButtonText}
          </button>
        </div>

        <div className="d-flex w-100 justify-content-between">
          <div>
            {photographerLinks.length > 0 ? (
              <>
                <span className="text-muted">{messages.Download.links}: </span>
                {photographerLinks.map((link, index) => (
                  <span key={`${link.who}-${link.href}`}>
                    {index > 0 ? " · " : null}
                    <a
                      className="link-subtle"
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.title}
                    </a>
                  </span>
                ))}
              </>
            ) : null}
          </div>
          <button type="button" className="btn btn-secondary" onClick={close}>
            {t.closeButtonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
