import { MessageCard, SignInRequired } from "@con2/components";
import type { ReactNode } from "react";

import { AppBar } from "@/components/AppBar";
import type { Viewer } from "@/gallery/viewer";
import { db } from "@/prisma/db";
import { getTranslations } from "@/translations";

interface ManageGateProps {
  locale: string;
  viewer: Viewer;
  title: string;
  /** Whether this viewer may see the page; computed by the caller with the relevant canManage*. */
  allowed: boolean;
  children: ReactNode;
}

/** Sign-in/forbidden gate shared by every /manage page, with the app bar shown either way. */
export async function ManageGate({
  locale,
  viewer,
  title,
  allowed,
  children,
}: ManageGateProps) {
  const t = getTranslations(locale);
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
          messages={{ title, message: t.Auth.signIn }}
        />
      </>
    );
  }
  if (!allowed) {
    return (
      <>
        {appBar}
        <MessageCard
          container
          title={title}
          message={t.Editor.errors.forbidden}
        />
      </>
    );
  }

  return (
    <>
      {appBar}
      {children}
    </>
  );
}
