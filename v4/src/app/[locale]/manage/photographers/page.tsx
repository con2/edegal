import { Messages, SubmitButton } from "@con2/components";
import type { Metadata } from "next";
import Link from "next/link";

import { ManageGate } from "@/components/ManageGate";
import { listPhotographersForAdmin } from "@/editor/managePhotographers";
import { canManagePhotographers } from "@/gallery/access";
import { getViewer } from "@/gallery/viewer";
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
  const allowed = canManagePhotographers(viewer);
  const rows = allowed ? await listPhotographersForAdmin() : [];

  return (
    <ManageGate
      locale={locale}
      viewer={viewer}
      title={m.title}
      allowed={allowed}
    >
      <div className="TextContent">
        <div className="container">
          <p>
            <Link href="/manage">{t.ManageIndex.title}</Link>
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
    </ManageGate>
  );
}
