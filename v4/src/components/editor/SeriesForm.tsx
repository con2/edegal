import { MarkdownEditor, SubmitButton } from "@con2/components";
import Link from "next/link";

import type { Translations } from "@/translations";

export interface SeriesFormValues {
  title: string;
  slug: string;
  description: string;
  visibility: "public" | "hidden" | "private";
  body: string;
}

export interface SeriesFormOptions {
  /** Legacy series with no v4 counterpart; their slugs are offered so a series can continue. */
  legacySeries: { slug: string; title: string }[];
}

interface SeriesFormProps {
  locale: string;
  action: (formData: FormData) => void | Promise<void>;
  heading: string;
  submitLabel: string;
  cancelHref: string;
  values: SeriesFormValues;
  options: SeriesFormOptions;
  messages: Translations["Editor"];
}

export function SeriesForm({
  locale,
  action,
  heading,
  submitLabel,
  cancelHref,
  values,
  options,
  messages,
}: SeriesFormProps) {
  const f = messages.fields;
  const visibilities = [
    {
      value: "public",
      label: f.visibilityPublic,
      help: f.seriesVisibilityPublicHelp,
    },
    {
      value: "hidden",
      label: f.visibilityHidden,
      help: f.visibilityHiddenHelp,
    },
    {
      value: "private",
      label: f.visibilityPrivate,
      help: f.seriesVisibilityPrivateHelp,
    },
  ] as const;

  return (
    <div className="TextContent">
      <form action={action} className="container">
        <h2 className="mb-4">{heading}</h2>

        <div className="mb-3">
          <label className="form-label" htmlFor="SeriesForm-title">
            {f.title} *
          </label>
          <input
            className="form-control"
            id="SeriesForm-title"
            name="title"
            type="text"
            required
            maxLength={1023}
            defaultValue={values.title}
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="SeriesForm-slug">
            {f.slug}
          </label>
          <input
            className="form-control"
            id="SeriesForm-slug"
            name="slug"
            type="text"
            pattern="[a-z0-9-]*"
            maxLength={255}
            list="SeriesForm-legacySlugs"
            autoComplete="off"
            defaultValue={values.slug}
          />
          <datalist id="SeriesForm-legacySlugs">
            {options.legacySeries.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </datalist>
          <div className="form-text">{f.seriesSlugHelp}</div>
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="SeriesForm-description">
            {f.description}
          </label>
          <input
            className="form-control"
            id="SeriesForm-description"
            name="description"
            type="text"
            maxLength={2000}
            defaultValue={values.description}
          />
          <div className="form-text">{f.descriptionHelp}</div>
        </div>

        <fieldset className="mb-3">
          <legend className="form-label fs-6">{f.visibility}</legend>
          {visibilities.map((v) => (
            <div className="form-check" key={v.value}>
              <input
                className="form-check-input"
                type="radio"
                name="visibility"
                id={`SeriesForm-visibility-${v.value}`}
                value={v.value}
                defaultChecked={values.visibility === v.value}
              />
              <label
                className="form-check-label"
                htmlFor={`SeriesForm-visibility-${v.value}`}
              >
                <strong>{v.label}</strong>{" "}
                <span className="text-muted">– {v.help}</span>
              </label>
            </div>
          ))}
        </fieldset>

        <div className="mb-3">
          <label className="form-label" htmlFor="SeriesForm-body">
            {f.body}
          </label>
          <MarkdownEditor
            id="SeriesForm-body"
            name="body"
            defaultValue={values.body}
            locale={locale}
            rows={8}
            maxLength={100_000}
          />
        </div>

        <div className="d-flex gap-2 mb-3">
          <SubmitButton variant="primary">{submitLabel}</SubmitButton>
          <Link className="btn btn-outline-secondary" href={cancelHref}>
            {messages.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
