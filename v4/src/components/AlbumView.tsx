import Link from "next/link";
import { Markdown } from "@con2/components";

import type { ClientAlbumPage, ClientSubalbum } from "@/gallery/types";
import type { Translations } from "@/translations";

import { AlbumGrid } from "./AlbumGrid";
import { PhotographerProfile } from "./PhotographerProfile";

interface AlbumViewProps {
  album: ClientAlbumPage;
  messages: { AlbumView: Translations["AlbumView"] };
  onOpenPhoto: (path: string) => void;
  /** Editor panels replace the description block, so it is not shown twice. */
  hideBody?: boolean;
}

interface Year {
  year: string | null;
  subalbums: ClientSubalbum[];
}

function groupByYear(subalbums: ClientSubalbum[]): Year[] {
  const years: Year[] = [];
  for (const subalbum of subalbums) {
    const year = subalbum.date ? subalbum.date.slice(0, 4) : null;
    const current = years[years.length - 1];
    if (!current || current.year !== year) {
      years.push({ year, subalbums: [subalbum] });
    } else {
      current.subalbums.push(subalbum);
    }
  }
  return years;
}

export function AlbumView({
  album,
  messages,
  onOpenPhoto,
  hideBody = false,
}: AlbumViewProps) {
  const isPhotographer = album.kind === "photographer";
  const hasBody =
    !hideBody && (isPhotographer || album.body.text.trim().length > 0);
  const hasSeriesLinks =
    !hideBody && (album.previousInSeries || album.nextInSeries);

  return (
    <main role="main">
      {hasBody || hasSeriesLinks ? (
        <div className="TextContent">
          {hasSeriesLinks ? (
            <div className="container d-flex mb-3">
              {album.nextInSeries ? (
                <Link href={album.nextInSeries.path}>
                  &laquo; {album.nextInSeries.title}
                </Link>
              ) : null}
              {album.previousInSeries ? (
                <Link className="ms-auto" href={album.previousInSeries.path}>
                  {album.previousInSeries.title} &raquo;
                </Link>
              ) : null}
            </div>
          ) : null}
          {hasBody ? (
            isPhotographer ? (
              <PhotographerProfile album={album} />
            ) : (
              <article className="container">
                {album.body.kind === "markdown" ? (
                  <Markdown input={album.body.text} />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: album.body.text }} />
                )}
              </article>
            )
          ) : null}
        </div>
      ) : null}

      {album.layout === "yearly" ? (
        <div className="YearlyView">
          {groupByYear(album.subalbums).map(({ year, subalbums }) => (
            <div key={year ?? "unknownYear"}>
              <h2>{year ?? messages.AlbumView.unknownYear}</h2>
              <AlbumGrid tiles={subalbums} showTitle />
            </div>
          ))}
        </div>
      ) : (
        <AlbumGrid tiles={album.subalbums} showTitle />
      )}

      <AlbumGrid
        tiles={album.photos}
        showTitle={false}
        onOpenPhoto={onOpenPhoto}
      />
    </main>
  );
}
