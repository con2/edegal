import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { T } from '../translations';
import Album from '../models/Album';
import Picture from '../models/Picture';
import contactPhotographer, { ContactRequest } from '../services/contactPhotographer';

interface Props {
  album: Album;
  picture?: Picture;
  isOpen: boolean;
  onClose(): void;
}

export function ContactDialog({ onClose, isOpen, album, picture }: Props): JSX.Element {
  const [page, setPage] = React.useState<'form' | 'success'>('form');
  const [isSending, setSending] = React.useState(false);
  const t = React.useMemo(() => T(r => r.ContactDialog), []);

  const handleClose = React.useCallback(() => {
    setSending(false);
    onClose();

    // avoid flash of contact form during closing animation
    setTimeout(() => setPage('form'), 500);
  }, [onClose]);

  const handleSuccess = React.useCallback(() => {
    setSending(false);
    setPage('success');
  }, []);

  const handleError = React.useCallback(() => {
    setSending(false);
    alert(t(r => r.errorText));
  }, []);

  const handleSubmit = React.useCallback(
    (event: React.SyntheticEvent) => {
      // NOTE: preventDefault must happen sync!
      event.preventDefault();

      const formData = new FormData(event.target as HTMLFormElement);
      const contactRequest: ContactRequest = (Object.fromEntries(
        formData.entries()
      ) as unknown) as ContactRequest;
      setSending(true);
      contactPhotographer(contactRequest).then(handleSuccess, handleError);
    },
    [handleClose]
  );

  const choices = [
    { slug: 'takedown', title: t(r => r.fields.subject.choices.takedown) },
    { slug: 'permission', title: t(r => r.fields.subject.choices.permission) },
    { slug: 'other', title: t(r => r.fields.subject.choices.other) },
  ];

  const path = picture ? picture.path : album.path;

  return (
    <Modal show={isOpen} onHide={handleClose} className="DownloadDialog">
      {page === 'form' && (
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{t(r => r.dialogTitle)}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3" controlId="contactFormRecipient">
              <Form.Label>{t(r => r.fields.recipient.title)}</Form.Label>
              <Form.Control type="text" value={album.credits.photographer?.display_name || ''} readOnly />
            </Form.Group>

            <Form.Group className="mb-3" controlId="contactFormContext">
              <Form.Label>
                {picture ? t(r => r.fields.picture.title) : t(r => r.fields.album.title)}
              </Form.Label>
              <Form.Control type="text" name="context" value={path} readOnly />
            </Form.Group>

            <Form.Group className="mb-3" controlId="contactFormEmail">
              <Form.Label>{t(r => r.fields.email.title)}</Form.Label>
              <Form.Control type="email" name="email" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="contactFormSubject">
              <Form.Label>{t(r => r.fields.subject.title)}</Form.Label>
              <Form.Select name="subject" required>
                <option></option>
                {choices.map(({ slug, title }) => (
                  <option key={slug} value={slug}>
                    {title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="contactFormMessage">
              <Form.Label>{t(r => r.fields.message.title)}</Form.Label>
              <Form.Control as="textarea" name="message" rows={5} required />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <button type="submit" className="btn btn-primary" disabled={isSending}>
              {isSending ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden={true} />{' '}
                  {t(r => r.sendingContactText ?? r.sendContactText)}…
                </>
              ) : (
                <>{t(r => r.sendContactText)}</>
              )}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              {t(r => r.closeButtonText)}
            </button>
          </Modal.Footer>
        </Form>
      )}

      {page === 'success' && (
        <>
          <Modal.Header>
            <Modal.Title>{t(r => r.dialogTitle)}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>{t(r => r.successText)}</p>
          </Modal.Body>

          <Modal.Footer>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              {t(r => r.closeButtonText)}
            </button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}

export default ContactDialog;
