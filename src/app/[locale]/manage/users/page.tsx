import type { Metadata } from "next";
import Link from "next/link";

import { ManageGate } from "@/components/ManageGate";
import { listUsersForAdmin } from "@/editor/manageUsers";
import { canManageUsers } from "@/gallery/access";
import { getViewer } from "@/gallery/viewer";
import { getTranslations } from "@/translations";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: getTranslations(locale).ManageUsers.title };
}

export default async function ManageUsersPage({ params }: Props) {
  const { locale } = await params;
  const t = getTranslations(locale);
  const m = t.ManageUsers;
  const viewer = await getViewer();
  const allowed = canManageUsers(viewer);
  const rows = allowed ? await listUsersForAdmin() : [];

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
          <h1 className="mb-2">{m.title}</h1>
          <p className="text-muted">{m.intro}</p>
          <table className="table align-middle">
            <thead>
              <tr>
                <th>{m.displayName}</th>
                <th>{m.email}</th>
                <th>{m.profile}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.displayName}</td>
                  <td>{row.email}</td>
                  <td>
                    {row.linkedPhotographer ? (
                      <Link
                        href={`/manage/photographers/${row.linkedPhotographer.id}`}
                      >
                        {row.linkedPhotographer.displayName}
                      </Link>
                    ) : (
                      <span className="text-muted">{m.noProfile}</span>
                    )}
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
