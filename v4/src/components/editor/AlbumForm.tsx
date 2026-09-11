import { MarkdownEditor, SubmitButton } from "@con2/components";
import Link from "next/link";

import type { MoveTarget } from "@/editor/albums";
import type { CreditInput } from "@/editor/schemas";
import type { Translations } from "@/translations";

import { CreditsEditor } from "./CreditsEditor";

export interface AlbumFormValues {
  title: string;
  slug: string;
  eventDate: string;
  visibility: "public" | "hidden" | "private";
  layout: "simple" | "yearly";
  /** Current parent's path; the edit form lets it be changed to one of `options.parents`. */
  parentPath: string;
  isOpenForSubalbums: boolean;
  isDownloadable: boolean;
  ordering: number;
  eventMetadataUrl: string;
  body: string;
  termsId: string;
  ownerId: string;
}

export interface AlbumFormOptions {
  /** Albums the edited album may be moved under, or null when it cannot be moved. */
  parents: MoveTarget[] | null;
  terms: { id: string; title: string }[];
  /** Title of the terms the album would inherit when none is chosen. */
  inheritedTermsTitle: string | null;
  photographers: { id: string; displayName: string }[];
  /** Only admins see the owner field. */
  users: { id: string; label: string }[] | null;
}

interface AlbumFormProps {
  locale: string;
  action: (formData: FormData) => void | Promise<void>;
  heading: string;
  submitLabel: string;
  cancelHref: string;
  values: AlbumFormValues;
  credits: CreditInput[];
  options: AlbumFormOptions;
  isRoot: boolean;
  /** Shown read-only on the new-album form so it is obvious where the album lands. */
  parent: { path: string; title: string } | null;
  messages: Translations["Editor"];
}

function Field({
  id,
  label,
  help,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {help ? <div className="form-text">{help}</div> : null}
    </div>
  );
}

export function AlbumForm({
  locale,
  action,
  heading,
  submitLabel,
  cancelHref,
  values,
  credits,
  options,
  isRoot,
  parent,
  messages,
}: AlbumFormProps) {
  const f = messages.fields;
  const visibilities: {
    value: AlbumFormValues["visibility"];
    label: string;
    help: string;
  }[] = [
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
  ];

  return (
    <div className="TextContent">
      <form action={action} className="container">
        <h2 className="mb-4">{heading}</h2>

        {parent ? (
          <Field id="AlbumForm-parent" label={f.parent} help={f.parentHelp}>
            <input
              className="form-control-plaintext fw-bold mb-0"
              id="AlbumForm-parent"
              type="text"
              readOnly
              value={`${parent.title} (${parent.path})`}
            />
          </Field>
        ) : null}
        {options.parents ? (
          <Field
            id="AlbumForm-parentPath"
            label={f.parent}
            help={f.parentMoveHelp}
          >
            <input
              className="form-control"
              id="AlbumForm-parentPath"
              name="parentPath"
              type="text"
              list="AlbumForm-parentOptions"
              autoComplete="off"
              defaultValue={values.parentPath}
            />
            <datalist id="AlbumForm-parentOptions">
              {options.parents.map((target) => (
                <option key={target.id} value={target.path}>
                  {target.title}
                </option>
              ))}
            </datalist>
          </Field>
        ) : null}

        <Field id="AlbumForm-title" label={`${f.title} *`}>
          <input
            className="form-control"
            id="AlbumForm-title"
            name="title"
            type="text"
            required
            maxLength={1023}
            defaultValue={values.title}
          />
        </Field>

        {!isRoot ? (
          <Field id="AlbumForm-slug" label={f.slug} help={f.slugHelp}>
            <input
              className="form-control"
              id="AlbumForm-slug"
              name="slug"
              type="text"
              pattern="[a-z0-9-]*"
              maxLength={255}
              defaultValue={values.slug}
            />
          </Field>
        ) : null}

        <div className="row">
          <div className="col-md-6">
            <Field
              id="AlbumForm-eventDate"
              label={f.eventDate}
              help={f.eventDateHelp}
            >
              <input
                className="form-control"
                id="AlbumForm-eventDate"
                name="eventDate"
                type="date"
                required
                defaultValue={values.eventDate}
              />
            </Field>
          </div>
          <div className="col-md-6">
            <Field
              id="AlbumForm-ordering"
              label={f.ordering}
              help={f.orderingHelp}
            >
              <input
                className="form-control"
                id="AlbumForm-ordering"
                name="ordering"
                type="number"
                step={1}
                defaultValue={values.ordering}
              />
            </Field>
          </div>
        </div>

        <Field id="AlbumForm-layout" label={f.layout} help={f.layoutHelp}>
          <select
            className="form-select"
            id="AlbumForm-layout"
            name="layout"
            defaultValue={values.layout}
          >
            <option value="simple">{f.layoutSimple}</option>
            <option value="yearly">{f.layoutYearly}</option>
          </select>
        </Field>

        <fieldset className="mb-3">
          <legend className="form-label fs-6">{f.visibility}</legend>
          {visibilities.map((v) => (
            <div className="form-check" key={v.value}>
              <input
                className="form-check-input"
                type="radio"
                name="visibility"
                id={`AlbumForm-visibility-${v.value}`}
                value={v.value}
                defaultChecked={values.visibility === v.value}
              />
              <label
                className="form-check-label"
                htmlFor={`AlbumForm-visibility-${v.value}`}
              >
                <strong>{v.label}</strong>{" "}
                <span className="text-muted">– {v.help}</span>
              </label>
            </div>
          ))}
        </fieldset>

        <div className="card border-warning mb-3">
          <div className="card-body">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="AlbumForm-open"
                name="isOpenForSubalbums"
                value="true"
                defaultChecked={values.isOpenForSubalbums}
              />
              <label
                className="form-check-label fw-bold"
                htmlFor="AlbumForm-open"
              >
                {f.openForSubalbums}
              </label>
            </div>
            <div className="form-text">{f.openForSubalbumsHelp}</div>
          </div>
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="AlbumForm-downloadable"
            name="isDownloadable"
            value="true"
            defaultChecked={values.isDownloadable}
          />
          <label className="form-check-label" htmlFor="AlbumForm-downloadable">
            {f.isDownloadable}
          </label>
        </div>

        <Field id="AlbumForm-body" label={f.body}>
          <MarkdownEditor
            id="AlbumForm-body"
            name="body"
            defaultValue={values.body}
            locale={locale}
            rows={8}
            maxLength={100_000}
          />
        </Field>

        <Field id="AlbumForm-terms" label={f.terms}>
          <select
            className="form-select"
            id="AlbumForm-terms"
            name="termsId"
            defaultValue={values.termsId}
          >
            <option value="">
              {f.termsInherit}
              {options.inheritedTermsTitle
                ? ` (${options.inheritedTermsTitle})`
                : ""}
            </option>
            {options.terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <Link className="form-text d-block" href="/profile">
            {f.manageTerms}
          </Link>
        </Field>

        <div className="mb-3">
          <div className="form-label">{f.credits}</div>
          <div className="form-text mb-2">{f.creditsHelp}</div>
          <CreditsEditor
            initial={credits}
            photographers={options.photographers}
            messages={f}
          />
        </div>

        <Field
          id="AlbumForm-eventMetadataUrl"
          label={f.eventMetadataUrl}
          help={f.eventMetadataUrlHelp}
        >
          <input
            className="form-control"
            id="AlbumForm-eventMetadataUrl"
            name="eventMetadataUrl"
            type="url"
            maxLength={1023}
            defaultValue={values.eventMetadataUrl}
          />
        </Field>

        {options.users ? (
          <Field id="AlbumForm-owner" label={f.owner}>
            <select
              className="form-select"
              id="AlbumForm-owner"
              name="ownerId"
              defaultValue={values.ownerId}
            >
              {options.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

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
