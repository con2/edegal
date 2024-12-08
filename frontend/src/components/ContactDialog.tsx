"use client";

import React from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

import Album from "../models/Album";
import Picture from "../models/Picture";
import contactPhotographer, {
  ContactRequest,
} from "../services/contactPhotographer";
import type { Translations } from "@/translations/en";

interface Props {
  album: Album;
  picture?: Picture;
  isOpen: boolean;
  onClose(): void;
  messages: Translations["ContactDialog"];
}

export default function ContactDialog({
  onClose,
  isOpen,
  album,
  picture,
  messages: t,
}: Props) {
  const [page, setPage] = React.useState<"form" | "success">("form");
  const [isSending, setSending] = React.useState(false);

  const handleClose = React.useCallback(() => {
    setSending(false);
    onClose();

    // avoid flash of contact form during closing animation
    setTimeout(() => setPage("form"), 500);
  }, [onClose]);

  const handleSuccess = React.useCallback(() => {
    setSending(false);
    setPage("success");
  }, []);

  const handleError = React.useCallback(() => {
    setSending(false);
    alert(t.errorText);
  }, []);

  const handleSubmit = React.useCallback(
    (event: React.SyntheticEvent) => {
      // NOTE: preventDefault must happen sync!
      event.preventDefault();

      const formData = new FormData(event.target as HTMLFormElement);
      const contactRequest: ContactRequest = Object.fromEntries(
        formData.entries()
      ) as unknown as ContactRequest;
      setSending(true);
      contactPhotographer(contactRequest).then(handleSuccess, handleError);
    },
    [handleClose]
  );

  const choices = [
    { slug: "takedown", title: t.fields.subject.choices.takedown },
    {
      slug: "permission",
      title: t.fields.subject.choices.permission,
    },
    { slug: "other", title: t.fields.subject.choices.other },
  ];

  const path = picture ? picture.path : album.path;

  return (
    <Modal show={isOpen} onHide={handleClose} className="DownloadDialog">
      {page === "form" && (
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{t.dialogTitle}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3" controlId="contactFormRecipient">
              <Form.Label>{t.fields.recipient.title}</Form.Label>
              <Form.Control
                type="text"
                value={album.credits.photographer?.display_name || ""}
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="contactFormContext">
              <Form.Label>
                {picture ? t.fields.picture.title : t.fields.album.title}
              </Form.Label>
              <Form.Control type="text" name="context" value={path} readOnly />
            </Form.Group>

            <Form.Group className="mb-3" controlId="contactFormEmail">
              <Form.Label>{t.fields.email.title}</Form.Label>
              <Form.Control type="email" name="email" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="contactFormSubject">
              <Form.Label>{t.fields.subject.title}</Form.Label>
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
              <Form.Label>{t.fields.message.title}</Form.Label>
              <Form.Control as="textarea" name="message" rows={5} required />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden={true}
                  />{" "}
                  {t.sendingContactText ?? t.sendingContactText}…
                </>
              ) : (
                <>{t.sendContactText}</>
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              {t.closeButtonText}
            </button>
          </Modal.Footer>
        </Form>
      )}

      {page === "success" && (
        <>
          <Modal.Header>
            <Modal.Title>{t.dialogTitle}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>{t.successText}</p>
          </Modal.Body>

          <Modal.Footer>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              {t.closeButtonText}
            </button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}
