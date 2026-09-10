import { Markdown } from "@con2/components";

import type { ClientAlbumPage } from "@/gallery/types";

import { Picture } from "./Picture";

/** Header of a photographer page: name, links, introduction and, for legacy photographers, the cover picture. */
export function PhotographerProfile({ album }: { album: ClientAlbumPage }) {
  const links = album.credits[0]?.links ?? [];
  const portrait = album.cover
    ? album.cover.fallback.height > album.cover.fallback.width
    : false;
  return (
    <div className="container">
      <div className="row">
        <div className={album.cover ? "col-md-8" : "col-12"}>
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
        {album.cover ? (
          <figure className={portrait ? "col-md-3" : "col-md-4"}>
            <Picture
              media={album.cover}
              alt={album.title}
              className="d-block"
            />
          </figure>
        ) : null}
      </div>
    </div>
  );
}
