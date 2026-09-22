"use client";

import { useState } from "react";
import Modal from "react-bootstrap/Modal";

import { contactSubjects } from "@/contact/schema";
import type { ClientAlbumPage, PhotoVM } from "@/gallery/types";
import type { Translations } from "@/translations";

interface ContactDialogProps {
  album: ClientAlbumPage;
  /** The photo the message is about; null makes it about the album. */
  photo: PhotoVM | null;
  show: boolean;
  onHide(): void;
  messages: Translations["ContactDialog"];
}

type Page = "form" | "success";

/** Lets a visitor write to the photographers credited for the album; the server relays it by email. */
export function ContactDialog({
  album,
  photo,
  show,
  onHide,
  messages: t,
}: ContactDialogProps) {
  const [page, setPage] = useState<Page>("form");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const context = photo?.path ?? album.path;
  const recipients = album.credits
    .filter((c) => c.isCopyright)
    .map((c) => c.displayName)
    .join(", ");

  const close = () => {
    setSending(false);
    setError(null);
    onHide();
    // The dialog fades out; switching the page during the fade would flash the form.
    setTimeout(() => setPage("form"), 500);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          context,
          email: form.get("email"),
          subject: form.get("subject"),
          message: form.get("message"),
        }),
      });
      if (response.ok) {
        setPage("success");
      } else {
        setError(response.status === 429 ? t.tooManyText : t.errorText);
      }
    } catch {
      setError(t.errorText);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal show={show} onHide={close} className="DownloadDialog">
      {page === "form" ? (
        <form onSubmit={submit}>
          <Modal.Header closeButton>
            <Modal.Title>{t.dialogTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label" htmlFor="ContactDialog-recipient">
                {t.fields.recipient}
              </label>
              <input
                className="form-control"
                id="ContactDialog-recipient"
                type="text"
                value={recipients}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="ContactDialog-context">
                {photo ? t.fields.picture : t.fields.album}
              </label>
              <input
                className="form-control"
                id="ContactDialog-context"
                type="text"
                value={context}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="ContactDialog-email">
                {t.fields.email}
              </label>
              <input
                className="form-control"
                id="ContactDialog-email"
                name="email"
                type="email"
                required
                maxLength={254}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="ContactDialog-subject">
                {t.fields.subject}
              </label>
              <select
                className="form-select"
                id="ContactDialog-subject"
                name="subject"
                required
                defaultValue=""
              >
                <option value=""></option>
                {contactSubjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {t.subjects[subject]}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="ContactDialog-message">
                {t.fields.message}
              </label>
              <textarea
                className="form-control"
                id="ContactDialog-message"
                name="message"
                rows={5}
                required
                maxLength={10_000}
              />
            </div>
            {error ? (
              <div className="alert alert-danger mb-0" role="alert">
                {error}
              </div>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
            >
              {sending ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  {t.sendingText}…
                </>
              ) : (
                t.sendText
              )}
            </button>
            <button type="button" className="btn btn-secondary" onClick={close}>
              {t.closeButtonText}
            </button>
          </Modal.Footer>
        </form>
      ) : (
        <>
          <Modal.Header closeButton>
            <Modal.Title>{t.dialogTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{t.successText}</p>
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className="btn btn-secondary" onClick={close}>
              {t.closeButtonText}
            </button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}
