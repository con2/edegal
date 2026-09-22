import {
  MarkdownEditor,
  MessageCard,
  Messages,
  SignInRequired,
  SubmitButton,
} from "@con2/components";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppBar } from "@/components/AppBar";
import { LinksEditor } from "@/components/profile/LinksEditor";
import {
  existingPhotographerEditValues,
  photographerEditOptions,
} from "@/editor/managePhotographers";
import { canManagePhotographers } from "@/gallery/access";
import { getViewer } from "@/gallery/viewer";
import { db } from "@/prisma/db";
import { getTranslations } from "@/translations";

import {
  mergePhotographersAction,
  updatePhotographerAsAdmin,
} from "../actions";

interface Props {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: getTranslations(locale).ManagePhotographers.title };
}

export default async function ManagePhotographerPage({
  params,
  searchParams,
}: Props) {
  const { locale, id } = await params;
  const t = getTranslations(locale);
  const m = t.ManagePhotographers;
  const viewer = await getViewer();
  const root = await db.orm.public.Album.where({ path: "/" })
    .select("path", "title")
    .first();
  const rootAlbum = root ?? { path: "/", title: "" };
  const appBar = (
    <AppBar
      rootAlbum={rootAlbum}
      viewer={viewer}
      locale={locale}
      messages={{
        AppBar: t.AppBar,
        Auth: t.Auth,
        LanguageSwitcher: t.LanguageSwitcher,
      }}
    />
  );

  if (viewer.kind !== "user") {
    return (
      <>
        {appBar}
        <SignInRequired
          locale={locale}
          providerId="kompassi"
          messages={{ title: m.title, message: t.Auth.signIn }}
        />
      </>
    );
  }
  if (!canManagePhotographers(viewer)) {
    return (
      <>
        {appBar}
        <MessageCard
          container
          title={m.title}
          message={t.Editor.errors.forbidden}
        />
      </>
    );
  }

  const [values, options] = await Promise.all([
    existingPhotographerEditValues(id),
    photographerEditOptions(id),
  ]);
  if (!values) notFound();

  const f = m.form;

  return (
    <>
      {appBar}
      <div className="TextContent">
        <div className="container">
          <p>
            <Link href="/manage/photographers">{m.backToList}</Link>
          </p>
          <Messages
            searchParams={await searchParams}
            messages={{
              saved: m.saved,
              slugTaken: m.slugTaken,
              userTaken: m.userTaken,
              merged: m.merge.merged,
              differentUsers: m.merge.differentUsers,
            }}
          />
          <h1 className="mb-4">{values.displayName}</h1>
          <form action={updatePhotographerAsAdmin.bind(null, locale, id)}>
            <div className="mb-3">
              <label className="form-label" htmlFor="Manage-displayName">
                {f.displayName} *
              </label>
              <input
                className="form-control"
                id="Manage-displayName"
                name="displayName"
                required
                maxLength={255}
                defaultValue={values.displayName}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="Manage-slug">
                {f.slug} *
              </label>
              <input
                className="form-control"
                id="Manage-slug"
                name="slug"
                required
                pattern="[a-z0-9-]+"
                maxLength={255}
                defaultValue={values.slug}
              />
              <div className="form-text">{f.slugHelp}</div>
            </div>
            <fieldset className="mb-3">
              <legend className="form-label fs-6">{f.visibility}</legend>
              {(
                [
                  { value: "public", label: f.visibilityPublic },
                  { value: "hidden", label: f.visibilityHidden },
                  { value: "private", label: f.visibilityPrivate },
                ] as const
              ).map((v) => (
                <div className="form-check" key={v.value}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="visibility"
                    id={`Manage-visibility-${v.value}`}
                    value={v.value}
                    defaultChecked={values.visibility === v.value}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`Manage-visibility-${v.value}`}
                  >
                    {v.label}
                  </label>
                </div>
              ))}
            </fieldset>
            <div className="mb-3">
              <label className="form-label" htmlFor="Manage-email">
                {f.email}
              </label>
              <input
                className="form-control"
                id="Manage-email"
                name="email"
                type="email"
                maxLength={254}
                defaultValue={values.email}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="Manage-introduction">
                {f.introduction}
              </label>
              <MarkdownEditor
                id="Manage-introduction"
                name="introduction"
                defaultValue={values.introduction}
                locale={locale}
                rows={6}
                maxLength={20_000}
              />
            </div>
            <div className="mb-3">
              <div className="form-label">{f.links}</div>
              <LinksEditor initial={values.links} messages={f} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="Manage-defaultTerms">
                {f.defaultTerms}
              </label>
              <select
                className="form-select"
                id="Manage-defaultTerms"
                name="defaultTermsId"
                defaultValue={values.defaultTermsId}
              >
                <option value="">{t.Editor.fields.termsInherit}</option>
                {options.terms.map((terms) => (
                  <option key={terms.id} value={terms.id}>
                    {terms.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="Manage-userId">
                {f.account}
              </label>
              <select
                className="form-select"
                id="Manage-userId"
                name="userId"
                defaultValue={values.userId}
              >
                <option value="">{f.accountNone}</option>
                {options.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                    {u.linkedElsewhere
                      ? ` — ${f.accountLinkedElsewhere} ${u.linkedElsewhere}`
                      : ""}
                  </option>
                ))}
              </select>
              {!values.userId && options.candidates.length > 0 ? (
                <div className="form-text">
                  {f.accountCandidateHint}{" "}
                  {options.candidates
                    .map((c) => `${c.displayName} (${c.email})`)
                    .join(", ")}
                </div>
              ) : null}
            </div>
            <SubmitButton variant="primary">{f.save}</SubmitButton>
          </form>

          {options.mergeTargets.length > 0 ? (
            <details className="mt-5">
              <summary className="fw-bold">{m.merge.title}</summary>
              <p className="text-muted mt-2">{m.merge.help}</p>
              <form
                action={mergePhotographersAction.bind(null, locale, id)}
                className="mt-2"
              >
                <div className="mb-3">
                  <label className="form-label" htmlFor="Manage-loserId">
                    {m.merge.target}
                  </label>
                  <select
                    className="form-select"
                    id="Manage-loserId"
                    name="loserId"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {m.merge.target}
                    </option>
                    {options.mergeTargets.map((target) => (
                      <option key={target.id} value={target.id}>
                        {target.label}
                      </option>
                    ))}
                  </select>
                </div>
                <SubmitButton
                  variant="outline-danger"
                  confirmationMessage={m.merge.confirm}
                >
                  {m.merge.submit}
                </SubmitButton>
              </form>
            </details>
          ) : null}
        </div>
      </div>
    </>
  );
}
