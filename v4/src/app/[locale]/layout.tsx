import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import type { ReactNode } from "react";

import { publicUrl } from "@/config";
import { toSupportedLanguage } from "@/i18n/locales";

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
  return (
    <html
      lang={toSupportedLanguage(locale)}
      className={roboto.variable}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
