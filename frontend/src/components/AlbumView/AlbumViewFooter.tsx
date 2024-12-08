import Album from "../../models/Album";
import Link from "next/link";
import { Translations } from "@/translations/en";

const getYear = (album: Album) =>
  album.date ? new Date(album.date).getUTCFullYear() : "";

interface Props {
  album: Album;
  messages: Translations["AlbumViewFooter"];
}

export default function AlbumViewFooter({ album, messages: t }: Props) {
  const { photographer } = album.credits;

  return (
    <footer className="AlbumViewFooter">
      {photographer ? (
        <>
          {t.albumCopyright} &copy; {getYear(album)}{" "}
          <Link href={photographer.path}>{photographer.display_name}</Link>.{" "}
        </>
      ) : null}
      Edegal &copy; 2010–2022{" "}
      <a href="https://github.com/con2/edegal">Santtu Pajukanta</a>.
    </footer>
  );
}
