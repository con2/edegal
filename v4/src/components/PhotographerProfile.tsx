import { Markdown } from "@con2/components";
import Link from "next/link";

import type { ClientAlbumPage } from "@/gallery/types";
import type { Translations } from "@/translations";

import { Picture } from "./Picture";

interface PhotographerProfileProps {
  album: ClientAlbumPage;
  messages: Translations["PhotographerProfile"];
}

/** Header of a photographer page: name, links, introduction and the profile photo with its credit. */
export function PhotographerProfile({
  album,
  messages,
}: PhotographerProfileProps) {
  const links = album.credits[0]?.links ?? [];
  const cover = album.cover;
  const portrait = cover
    ? cover.media.fallback.height > cover.media.fallback.width
    : false;
  const picture = cover ? (
    <Picture media={cover.media} alt={album.title} className="d-block" />
  ) : null;
  return (
    <div className="container">
      <div className="row">
        <div className={cover ? "col-md-8" : "col-12"}>
          <h1>{album.title}</h1>
          {links.length > 0 ? (
            <ul className="PhotographerProfile-socialMediaLinks">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {album.body.text.trim() ? (
            album.body.kind === "markdown" ? (
              <Markdown input={album.body.text} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: album.body.text }} />
            )
          ) : null}
        </div>
        {cover ? (
          <figure className={portrait ? "col-md-3" : "col-md-4"}>
            {cover.path ? (
              <Link href={cover.path} className="d-block">
                {picture}
              </Link>
            ) : (
              picture
            )}
            {cover.credits.length > 0 ? (
              <figcaption className="PhotographerProfile-coverCredit text-muted small mt-1">
                {messages.photo}{" "}
                {cover.credits.map((credit, index) => (
                  <span key={credit.path ?? credit.displayName}>
                    {index > 0 ? ", " : ""}
                    {credit.path ? (
                      <Link href={credit.path}>{credit.displayName}</Link>
                    ) : (
                      credit.displayName
                    )}
                  </span>
                ))}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>
    </div>
  );
}
