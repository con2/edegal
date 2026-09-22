import { MarkdownEditor, SubmitButton } from "@con2/components";
import Link from "next/link";

import type { Translations } from "@/translations";

interface PhotographersIntroFormProps {
  locale: string;
  action: (formData: FormData) => void | Promise<void>;
  body: string;
  cancelHref: string;
  messages: Translations["Editor"];
}

/** The /photographers index has no owner of its own; only admins shape its introduction text. */
export function PhotographersIntroForm({
  locale,
  action,
  body,
  cancelHref,
  messages,
}: PhotographersIntroFormProps) {
  return (
    <div className="TextContent">
      <form action={action} className="container">
        <h2 className="mb-4">{messages.editPhotographersIntroTitle}</h2>
        <div className="mb-3">
          <label className="form-label" htmlFor="PhotographersIntroForm-body">
            {messages.fields.body}
          </label>
          <MarkdownEditor
            id="PhotographersIntroForm-body"
            name="body"
            defaultValue={body}
            locale={locale}
            rows={8}
            maxLength={100_000}
          />
        </div>
        <div className="d-flex gap-2 mb-3">
          <SubmitButton variant="primary">{messages.save}</SubmitButton>
          <Link className="btn btn-outline-secondary" href={cancelHref}>
            {messages.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
