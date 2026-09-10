import type { ClientAlbumPage } from "@/gallery/types";
import type { Translations } from "@/translations";

interface AlbumViewFooterProps {
  album: ClientAlbumPage;
  messages: Translations["AlbumViewFooter"];
}

export function AlbumViewFooter({ album, messages }: AlbumViewFooterProps) {
  const copyrightHolders = album.credits.filter((c) => c.isCopyright);
  const year = album.date ? album.date.slice(0, 4) : "";
  return (
    <footer className="AlbumViewFooter">
      {copyrightHolders.length > 0 ? (
        <>
          {messages.albumCopyright} &copy; {year}{" "}
          {copyrightHolders.map((c) => c.displayName).join(", ")}.{" "}
        </>
      ) : null}
      Edegal &copy; 2010–2026{" "}
      <a href="https://github.com/con2/edegal">Luka Pajukanta</a>.
    </footer>
  );
}
