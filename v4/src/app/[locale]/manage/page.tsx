import type { Metadata } from "next";
import Link from "next/link";

import { ManageGate } from "@/components/ManageGate";
import { isAdmin } from "@/gallery/access";
import { getViewer } from "@/gallery/viewer";
import { getTranslations } from "@/translations";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: getTranslations(locale).ManageIndex.title };
}

export default async function ManageIndexPage({ params }: Props) {
  const { locale } = await params;
  const t = getTranslations(locale);
  const m = t.ManageIndex;
  const viewer = await getViewer();
  const allowed = isAdmin(viewer);

  const sections = [
    {
      href: "/manage/photographers",
      title: m.photographers,
      help: m.photographersHelp,
    },
    { href: "/manage/redirects", title: m.redirects, help: m.redirectsHelp },
    { href: "/manage/users", title: m.users, help: m.usersHelp },
  ];

  return (
    <ManageGate
      locale={locale}
      viewer={viewer}
      title={m.title}
      allowed={allowed}
    >
      <div className="TextContent">
        <div className="container">
          <h1 className="mb-4">{m.title}</h1>
          <div className="list-group">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="list-group-item list-group-item-action"
              >
                <div className="fw-bold">{section.title}</div>
                <div className="text-muted">{section.help}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ManageGate>
  );
}
