"use client";

import React from "react";

import Modal from "react-bootstrap/Modal";

import Album from "../models/Album";
import Linebreaks from "./Linebreaks";
import type { Translations } from "@/translations/en";

interface Props {
  album: Album;
  isPreparing?: boolean;
  isOpen: boolean;
  onClose(): void;
  onAccept(): void;
  onContactPhotographer(): void;
  messages:
    | Translations["DownloadDialog"]
    | Translations["DownloadAlbumDialog"];
}

export function useDialogState() {
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const openDialog = React.useCallback(() => setDialogOpen(true), []);
  const closeDialog = React.useCallback(() => setDialogOpen(false), []);

  return { isDialogOpen, openDialog, closeDialog };
}

export default function DownloadDialog({
  album,
  onAccept,
  onClose,
  onContactPhotographer,
  messages: t,
  isPreparing,
  isOpen,
}: Props) {
  const [isTermsAndConditionsAccepted, setTermsAndConditionsAccepted] =
    React.useState(false);
  const [downloadButtonClicked, setDownloadButtonClicked] =
    React.useState(false);
  const handleAccept = React.useCallback(() => {
    setDownloadButtonClicked(true);
    onAccept();
  }, [onAccept]);
  const handleClose = React.useCallback(() => {
    setDownloadButtonClicked(false);
    setTermsAndConditionsAccepted(false);
    onClose();
  }, [onClose]);
  const handleContactPhotographer = React.useCallback(() => {
    setDownloadButtonClicked(false);
    setTermsAndConditionsAccepted(false);
    onContactPhotographer();
  }, [onContactPhotographer]);
  const toggleTermsAndConditionsAccepted = React.useCallback(() => {
    setTermsAndConditionsAccepted(!isTermsAndConditionsAccepted);
  }, [isTermsAndConditionsAccepted]);

  const text =
    album && album.terms_and_conditions ? album.terms_and_conditions.text : "";
  const { photographer, director } = album.credits;

  const haveTwitter =
    (photographer && photographer.twitter_handle) ||
    (director && director.twitter_handle);
  const haveInstagram =
    (photographer && photographer.instagram_handle) ||
    (director && director.instagram_handle);
  const haveCredit =
    (photographer && photographer.display_name) ||
    (director && director.display_name);

  return (
    <Modal show={isOpen} onHide={handleClose} className="DownloadDialog">
      <Modal.Header closeButton>
        <Modal.Title>{t.dialogTitle}</Modal.Title>
      </Modal.Header>

      <div className="modal-body">
        <p>
          <strong>{t.termsAndConditions}</strong>
        </p>
        <Linebreaks text={text || t.defaultTerms} />

        {haveTwitter ? (
          <>
            <p>
              <strong>{t.twitterCredit}</strong>
            </p>
            <p>
              {photographer ? (
                <>
                  📸{" "}
                  {photographer.twitter_handle
                    ? `@${photographer.twitter_handle}`
                    : photographer.display_name}{" "}
                </>
              ) : null}
              {director ? (
                <>
                  🎬{" "}
                  {director.twitter_handle
                    ? `@${director.twitter_handle}`
                    : director.display_name}{" "}
                </>
              ) : null}
            </p>
          </>
        ) : null}

        {haveInstagram ? (
          <>
            <p>
              <strong>{t.instagramCredit}</strong>
            </p>
            <p>
              {photographer ? (
                <>
                  {t.photographer}:{" "}
                  {photographer.instagram_handle
                    ? `@${photographer.instagram_handle}`
                    : photographer.display_name}
                  <br />
                </>
              ) : null}
              {director ? (
                <>
                  {t.director}:{" "}
                  {director.instagram_handle
                    ? `@${director.instagram_handle}`
                    : director.display_name}
                  <br />
                </>
              ) : null}
            </p>
          </>
        ) : null}

        {haveCredit ? (
          <>
            <p>
              <strong>
                {haveTwitter || haveInstagram
                  ? t.genericCredit
                  : t.genericCreditAlternative}
              </strong>
            </p>
            <p>
              {photographer && photographer.display_name ? (
                <>
                  {t.photographer}: {photographer.display_name}
                  <br />
                </>
              ) : null}
              {director && director.display_name ? (
                <>
                  {t.director}: {director.display_name}
                  <br />
                </>
              ) : null}
            </p>
          </>
        ) : null}
      </div>

      <div className="modal-footer">
        <div className="d-flex w-100 justify-content-between">
          <label className="mt-2 d-block">
            <input
              type="checkbox"
              disabled={downloadButtonClicked}
              checked={isTermsAndConditionsAccepted}
              onChange={toggleTermsAndConditionsAccepted}
            />
            {" " + t.acceptTermsAndConditions}
          </label>

          <button
            type="button"
            className="btn btn-primary"
            disabled={!isTermsAndConditionsAccepted || isPreparing}
            onClick={handleAccept}
          >
            {isPreparing ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden={true}
                />{" "}
                {t.preparingDownloadButtonText ?? t.downloadButtonText}…
              </>
            ) : (
              <>{t.downloadButtonText}</>
            )}
          </button>
        </div>

        <div className="d-flex w-100 justify-content-between">
          <div>
            {album.credits.photographer ? (
              <button
                type="button"
                className="btn btn-link link-subtle ps-1"
                onClick={handleContactPhotographer}
              >
                {t.contactPhotographer}…
              </button>
            ) : (
              <div />
            )}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
          >
            {t.closeButtonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
