import {
  MarkdownEditor,
  MessageCard,
  Messages,
  SignInRequired,
  SubmitButton,
} from "@con2/components";
import type { Metadata } from "next";

import { AppBar } from "@/components/AppBar";
import { LinksEditor } from "@/components/profile/LinksEditor";
import { getViewer } from "@/gallery/viewer";
import { db } from "@/prisma/db";
import { getTranslations } from "@/translations";

import {
  createTerms,
  deleteTerms,
  updatePhotographer,
  updateTerms,
} from "./actions";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: getTranslations(locale).Profile.title };
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = getTranslations(locale);
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
          messages={{ title: t.Profile.title, message: t.Auth.signIn }}
        />
      </>
    );
  }
  if (!viewer.isPhotographer) {
    return (
      <>
        {appBar}
        <MessageCard
          container
          title={t.Profile.title}
          message={t.Editor.errors.forbidden}
        />
      </>
    );
  }

  const [photographer, ownTerms] = await Promise.all([
    db.orm.public.Photographer.where({ userId: viewer.userId })
      .include("links", (l) => l.orderBy((x) => x.ordering.asc()))
      .first(),
    db.orm.public.Terms.where({ ownerId: viewer.userId })
      .orderBy((x) => x.title.asc())
      .all(),
  ]);
  const p = t.Profile;

  return (
    <>
      {appBar}
      <div className="TextContent">
        <div className="container">
          <Messages
            searchParams={await searchParams}
            messages={{
              saved: p.saved,
              termsSaved: p.terms.saved,
              termsDeleted: p.terms.deleted,
              termsInUse: p.terms.inUse,
            }}
          />

          <h1 className="mb-2">{p.title}</h1>
          <p className="text-muted">{p.intro}</p>
          <form action={updatePhotographer.bind(null, locale)}>
            <div className="mb-3">
              <label className="form-label" htmlFor="Profile-displayName">
                {p.displayName} *
              </label>
              <input
                className="form-control"
                id="Profile-displayName"
                name="displayName"
                required
                maxLength={255}
                defaultValue={photographer?.displayName ?? viewer.name ?? ""}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="Profile-email">
                {p.email}
              </label>
              <input
                className="form-control"
                id="Profile-email"
                name="email"
                type="email"
                maxLength={254}
                defaultValue={photographer?.email ?? ""}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="Profile-introduction">
                {p.introduction}
              </label>
              <MarkdownEditor
                id="Profile-introduction"
                name="introduction"
                defaultValue={photographer?.introduction ?? ""}
                locale={locale}
                rows={6}
                maxLength={20_000}
              />
            </div>
            <div className="mb-3">
              <div className="form-label">{p.links}</div>
              <LinksEditor
                initial={
                  photographer?.links.map(({ title, href }) => ({
                    title,
                    href,
                  })) ?? []
                }
                messages={p}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="Profile-defaultTerms">
                {p.defaultTerms}
              </label>
              <select
                className="form-select"
                id="Profile-defaultTerms"
                name="defaultTermsId"
                defaultValue={photographer?.defaultTermsId ?? ""}
              >
                <option value="">{t.Editor.fields.termsInherit}</option>
                {ownTerms.map((terms) => (
                  <option key={terms.id} value={terms.id}>
                    {terms.title}
                  </option>
                ))}
              </select>
            </div>
            <SubmitButton variant="primary">{p.save}</SubmitButton>
          </form>

          <h2 className="mt-5 mb-2">{p.terms.title}</h2>
          <p className="text-muted">{p.terms.help}</p>
          {ownTerms.map((terms) => (
            <details className="mb-3" key={terms.id}>
              <summary className="fw-bold">{terms.title}</summary>
              <form
                action={updateTerms.bind(null, locale, terms.id)}
                className="mt-2"
              >
                <TermsFields
                  id={terms.id}
                  values={terms}
                  locale={locale}
                  messages={p.terms}
                />
                <div className="d-flex gap-2">
                  <SubmitButton variant="primary">
                    {p.terms.update}
                  </SubmitButton>
                </div>
              </form>
              <form
                action={deleteTerms.bind(null, locale, terms.id)}
                className="mt-2"
              >
                <SubmitButton
                  variant="outline-danger"
                  size="sm"
                  confirmationMessage={p.terms.confirmDelete}
                >
                  {p.terms.delete}
                </SubmitButton>
              </form>
            </details>
          ))}
          <details className="mb-5" open={ownTerms.length === 0}>
            <summary className="fw-bold">{p.terms.newTerms}</summary>
            <form action={createTerms.bind(null, locale)} className="mt-2">
              <TermsFields
                id="new"
                values={{ title: "", text: "", url: "" }}
                locale={locale}
                messages={p.terms}
              />
              <SubmitButton variant="primary">{p.terms.create}</SubmitButton>
            </form>
          </details>
        </div>
      </div>
    </>
  );
}

function TermsFields({
  id,
  values,
  locale,
  messages,
}: {
  id: string;
  values: { title: string; text: string; url: string };
  locale: string;
  messages: ReturnType<typeof getTranslations>["Profile"]["terms"];
}) {
  return (
    <>
      <div className="mb-3">
        <label className="form-label" htmlFor={`Terms-${id}-title`}>
          {messages.termsTitle} *
        </label>
        <input
          className="form-control"
          id={`Terms-${id}-title`}
          name="title"
          required
          maxLength={255}
          defaultValue={values.title}
        />
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor={`Terms-${id}-text`}>
          {messages.termsText} *
        </label>
        <MarkdownEditor
          id={`Terms-${id}-text`}
          name="text"
          defaultValue={values.text}
          locale={locale}
          rows={6}
          required
          maxLength={20_000}
        />
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor={`Terms-${id}-url`}>
          {messages.termsUrl}
        </label>
        <input
          className="form-control"
          id={`Terms-${id}-url`}
          name="url"
          type="url"
          maxLength={1023}
          defaultValue={values.url}
        />
      </div>
    </>
  );
}
