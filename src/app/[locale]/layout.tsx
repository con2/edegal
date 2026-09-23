import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { Roboto } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { publicUrl } from "@/config";
import { routing } from "@/i18n/routing";

import "./globals.scss";

const roboto = Roboto({
  weight: ["100", "400", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicUrl),
};

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  // Paths the proxy skips, such as an unknown /api/..., reach this layout with their first segment
  // as the locale.
  if (!hasLocale(routing.locales, locale)) notFound();
  return (
    <html
      lang={locale}
      className={roboto.variable}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
