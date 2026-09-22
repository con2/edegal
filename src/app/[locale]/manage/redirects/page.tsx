import { Messages, SubmitButton } from "@con2/components";
import type { Metadata } from "next";
import Link from "next/link";

import { ManageGate } from "@/components/ManageGate";
import { listRedirectsForAdmin } from "@/editor/manageRedirects";
import { canManageRedirects } from "@/gallery/access";
import { getViewer } from "@/gallery/viewer";
import { pgTimestampToIso } from "@/lib/time";
import { getTranslations } from "@/translations";

import { createRedirect, deleteRedirectAction } from "./actions";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: getTranslations(locale).ManageRedirects.title };
}

export default async function ManageRedirectsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const t = getTranslations(locale);
  const m = t.ManageRedirects;
  const viewer = await getViewer();
  const allowed = canManageRedirects(viewer);
  const rows = allowed ? await listRedirectsForAdmin() : [];

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
              deleted: m.deleted,
              invalid: m.invalid,
            }}
          />
          <h1 className="mb-2">{m.title}</h1>
          <p className="text-muted">{m.intro}</p>
          <table className="table align-middle">
            <thead>
              <tr>
                <th>{m.from}</th>
                <th>{m.to}</th>
                <th>{m.created}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.fromPath}>
                  <td>
                    <code>{row.fromPath}</code>
                  </td>
                  <td>
                    {row.toPath.includes("://") ? (
                      <a href={row.toPath} target="_blank" rel="noreferrer">
                        {row.toPath}
                      </a>
                    ) : (
                      <Link href={row.toPath}>{row.toPath}</Link>
                    )}
                  </td>
                  <td>{pgTimestampToIso(row.createdAt).slice(0, 10)}</td>
                  <td>
                    <form action={deleteRedirectAction.bind(null, locale)}>
                      <input
                        type="hidden"
                        name="fromPath"
                        value={row.fromPath}
                      />
                      <SubmitButton
                        variant="outline-danger"
                        size="sm"
                        confirmationMessage={m.confirmDelete}
                      >
                        {m.delete}
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <details className="mt-4" open={rows.length === 0}>
            <summary className="fw-bold">{m.addTitle}</summary>
            <form action={createRedirect.bind(null, locale)} className="mt-2">
              <div className="mb-3">
                <label className="form-label" htmlFor="Redirect-fromPath">
                  {m.from} *
                </label>
                <input
                  className="form-control"
                  id="Redirect-fromPath"
                  name="fromPath"
                  required
                  maxLength={1023}
                  placeholder="/old-address"
                />
                <div className="form-text">{m.fromHelp}</div>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="Redirect-toPath">
                  {m.to} *
                </label>
                <input
                  className="form-control"
                  id="Redirect-toPath"
                  name="toPath"
                  required
                  maxLength={1023}
                  placeholder="/new-address"
                />
                <div className="form-text">{m.toHelp}</div>
              </div>
              <SubmitButton variant="primary">{m.add}</SubmitButton>
            </form>
          </details>
        </div>
      </div>
    </ManageGate>
  );
}
