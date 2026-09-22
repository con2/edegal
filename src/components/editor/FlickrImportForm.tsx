import { SubmitButton } from "@con2/components";
import Link from "next/link";

import type { Translations } from "@/translations";

interface FlickrImportFormProps {
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: string;
  parent: { path: string; title: string };
  messages: Translations["Editor"];
}

export function FlickrImportForm({
  action,
  cancelHref,
  parent,
  messages,
}: FlickrImportFormProps) {
  const f = messages.fields;
  const visibilities = [
    {
      value: "public",
      label: f.visibilityPublic,
      help: f.visibilityPublicHelp,
    },
    {
      value: "hidden",
      label: f.visibilityHidden,
      help: f.visibilityHiddenHelp,
    },
    {
      value: "private",
      label: f.visibilityPrivate,
      help: f.visibilityPrivateHelp,
    },
  ] as const;

  return (
    <div className="TextContent">
      <form action={action} className="container">
        <h2 className="mb-4">{messages.importFlickrTitle}</h2>
        <p>{messages.importFlickrHelp}</p>

        <div className="mb-3">
          <label className="form-label" htmlFor="FlickrImportForm-parent">
            {f.parent}
          </label>
          <input
            className="form-control-plaintext fw-bold mb-0"
            id="FlickrImportForm-parent"
            type="text"
            readOnly
            value={`${parent.title} (${parent.path})`}
          />
          <div className="form-text">{f.parentHelp}</div>
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="FlickrImportForm-flickrUrl">
            {f.flickrUrl} *
          </label>
          <input
            className="form-control"
            id="FlickrImportForm-flickrUrl"
            name="flickrUrl"
            type="url"
            required
            maxLength={1023}
            placeholder="https://www.flickr.com/photos/…/albums/…"
            autoComplete="off"
          />
          <div className="form-text">{f.flickrUrlHelp}</div>
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="FlickrImportForm-title">
            {f.title}
          </label>
          <input
            className="form-control"
            id="FlickrImportForm-title"
            name="title"
            type="text"
            maxLength={1023}
          />
          <div className="form-text">{f.importTitleHelp}</div>
        </div>

        <fieldset className="mb-3">
          <legend className="form-label fs-6">{f.visibility}</legend>
          {visibilities.map((v) => (
            <div className="form-check" key={v.value}>
              <input
                className="form-check-input"
                type="radio"
                name="visibility"
                id={`FlickrImportForm-visibility-${v.value}`}
                value={v.value}
                defaultChecked={v.value === "public"}
              />
              <label
                className="form-check-label"
                htmlFor={`FlickrImportForm-visibility-${v.value}`}
              >
                <strong>{v.label}</strong>{" "}
                <span className="text-muted">– {v.help}</span>
              </label>
            </div>
          ))}
        </fieldset>

        <div className="d-flex gap-2 mb-3">
          <SubmitButton variant="primary">
            {messages.importFlickrSubmit}
          </SubmitButton>
          <Link className="btn btn-outline-secondary" href={cancelHref}>
            {messages.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
