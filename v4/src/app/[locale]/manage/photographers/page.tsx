import {
  MessageCard,
  Messages,
  SignInRequired,
  SubmitButton,
} from "@con2/components";
import type { Metadata } from "next";
import Link from "next/link";

import { AppBar } from "@/components/AppBar";
import { listPhotographersForAdmin } from "@/editor/managePhotographers";
import { canManagePhotographers } from "@/gallery/access";
import { getViewer } from "@/gallery/viewer";
import { db } from "@/prisma/db";
import { getTranslations } from "@/translations";

import { quickLinkPhotographer } from "./actions";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: getTranslations(locale).ManagePhotographers.title };
}

export default async function ManagePhotographersPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
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

  const rows = await listPhotographersForAdmin();

  return (
    <>
      {appBar}
      <div className="TextContent">
        <div className="container">
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
          <h1 className="mb-2">{m.title}</h1>
          <p className="text-muted">{m.intro}</p>
          <table className="table align-middle">
            <thead>
              <tr>
                <th>{m.list.displayName}</th>
                <th>{m.list.account}</th>
                <th>{m.list.credits}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/photographers/${row.slug}`}>
                      {row.displayName}
                    </Link>
                  </td>
                  <td>
                    {row.linkedUser ? (
                      row.linkedUser.displayName || row.linkedUser.email
                    ) : (
                      <span className="d-flex align-items-center gap-2">
                        <span className="badge text-bg-warning">
                          {m.list.notLinked}
                        </span>
                        {row.soleCandidate ? (
                          <form
                            action={quickLinkPhotographer.bind(
                              null,
                              locale,
                              row.id,
                              row.soleCandidate.id,
                            )}
                          >
                            <SubmitButton variant="outline-primary" size="sm">
                              {m.list.quickLink} {row.soleCandidate.displayName}
                            </SubmitButton>
                          </form>
                        ) : null}
                      </span>
                    )}
                  </td>
                  <td>{row.creditCount}</td>
                  <td>
                    <Link
                      className="btn btn-link btn-sm"
                      href={`/manage/photographers/${row.id}`}
                    >
                      {m.list.edit}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
