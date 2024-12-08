import type { Metadata } from "next";
import "./index.scss";

export const metadata: Metadata = {
  title: "Edegal",
  description: "Fast Web Image Gallery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // FIXME lang
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
