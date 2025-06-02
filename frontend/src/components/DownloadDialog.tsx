import React from 'react';

import Modal from 'react-bootstrap/Modal';

import Album from '../models/Album';
import Linebreaks from './Linebreaks';
import { TranslationFunction } from '../translations';

interface DownloadDialogTranslations {
  acceptTermsAndConditions: string;
  closeButtonText: string;
  contact: string;
  defaultTerms: string;
  dialogTitle: string;
  director: string;
  downloadButtonText: string;
  genericCredit: string;
  genericCreditAlternative: string;
  instagramCredit: string;
  threadsCredit: string;
  blueskyCredit: string;
  photographer: string;
  preparingDownloadButtonText?: string;
  termsAndConditions: string;
  twitterCredit: string;
  contactPhotographer: string;
}

interface DownloadDialogProps {
  album: Album;
  isPreparing?: boolean;
  isOpen: boolean;
  onClose(): void;
  onAccept(): void;
  onContactPhotographer(): void;
  t: TranslationFunction<DownloadDialogTranslations>; // TODO
}

export function useDialogState() {
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const openDialog = React.useCallback(() => setDialogOpen(true), []);
  const closeDialog = React.useCallback(() => setDialogOpen(false), []);

  return { isDialogOpen, openDialog, closeDialog };
}

export function DownloadDialog({
  album,
  onAccept,
  onClose,
  onContactPhotographer,
  t,
  isPreparing,
  isOpen,
}: DownloadDialogProps): JSX.Element {
  const [isTermsAndConditionsAccepted, setTermsAndConditionsAccepted] = React.useState(false);
  const [downloadButtonClicked, setDownloadButtonClicked] = React.useState(false);
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

  const text = album && album.terms_and_conditions ? album.terms_and_conditions.text : '';
  const { photographer, director } = album.credits;

  // XXX
  const haveTwitter = (photographer && photographer.twitter_handle) || (director && director.twitter_handle);
  const haveInstagram =
    (photographer && photographer.instagram_handle) || (director && director.instagram_handle);
  const haveThreads = (photographer && photographer.threads_handle) || (director && director.threads_handle);
  const haveBluesky = (photographer && photographer.bluesky_handle) || (director && director.bluesky_handle);

  const haveCredit = (photographer && photographer.display_name) || (director && director.display_name);

  return (
    <Modal show={isOpen} onHide={handleClose} className="DownloadDialog">
      <Modal.Header closeButton>
        <Modal.Title>{t(r => r.dialogTitle)}</Modal.Title>
      </Modal.Header>

      <div className="modal-body">
        <p>
          <strong>{t(r => r.termsAndConditions)}</strong>
        </p>
        <Linebreaks text={text || t(r => r.defaultTerms)} />

        {haveTwitter ? (
          <>
            <p>
              <strong>{t(r => r.twitterCredit)}</strong>
            </p>
            <p>
              {photographer ? (
                <>
                  📸{' '}
                  {photographer.twitter_handle
                    ? `@${photographer.twitter_handle}`
                    : photographer.display_name}{' '}
                </>
              ) : null}
              {director ? (
                <>🎬 {director.twitter_handle ? `@${director.twitter_handle}` : director.display_name} </>
              ) : null}
            </p>
          </>
        ) : null}

        {haveInstagram ? (
          <>
            <p>
              <strong>{t(r => r.instagramCredit)}</strong>
            </p>
            <p>
              {photographer ? (
                <>
                  {t(r => r.photographer)}:{' '}
                  {photographer.instagram_handle
                    ? `@${photographer.instagram_handle}`
                    : photographer.display_name}
                  <br />
                </>
              ) : null}
              {director ? (
                <>
                  {t(r => r.director)}:{' '}
                  {director.instagram_handle ? `@${director.instagram_handle}` : director.display_name}
                  <br />
                </>
              ) : null}
            </p>
          </>
        ) : null}

        {haveThreads ? (
          <>
            <p>
              <strong>{t(r => r.threadsCredit)}</strong>
            </p>
            <p>
              {photographer ? (
                <>
                  {t(r => r.photographer)}:{' '}
                  {photographer.threads_handle
                    ? `@${photographer.threads_handle}`
                    : photographer.display_name}
                  <br />
                </>
              ) : null}
              {director ? (
                <>
                  {t(r => r.director)}:{' '}
                  {director.threads_handle ? `@${director.threads_handle}` : director.display_name}
                  <br />
                </>
              ) : null}
            </p>
          </>
        ) : null}

        {haveBluesky ? (
          <>
            <p>
              <strong>{t(r => r.blueskyCredit)}</strong>
            </p>
            <p>
              {photographer ? (
                <>
                  {t(r => r.photographer)}:{' '}
                  {photographer.bluesky_handle
                    ? `@${photographer.bluesky_handle}`
                    : photographer.display_name}
                  <br />
                </>
              ) : null}
              {director ? (
                <>
                  {t(r => r.director)}:{' '}
                  {director.bluesky_handle ? `@${director.bluesky_handle}` : director.display_name}
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
                {haveTwitter || haveInstagram ? t(r => r.genericCredit) : t(r => r.genericCreditAlternative)}
              </strong>
            </p>
            <p>
              {photographer && photographer.display_name ? (
                <>
                  {t(r => r.photographer)}: {photographer.display_name}
                  <br />
                </>
              ) : null}
              {director && director.display_name ? (
                <>
                  {t(r => r.director)}: {director.display_name}
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
            {' ' + t(r => r.acceptTermsAndConditions)}
          </label>

          <button
            type="button"
            className="btn btn-primary"
            disabled={!isTermsAndConditionsAccepted || isPreparing}
            onClick={handleAccept}
          >
            {isPreparing ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden={true} />{' '}
                {t(r => r.preparingDownloadButtonText ?? r.downloadButtonText)}…
              </>
            ) : (
              <>{t(r => r.downloadButtonText)}</>
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
                {t(r => r.contactPhotographer)}…
              </button>
            ) : (
              <div />
            )}
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            {t(r => r.closeButtonText)}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DownloadDialog;
