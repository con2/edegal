import Link from "next/link";

import type { MediaSet, Visibility } from "@/gallery/types";

import { LaunchIcon, LockOpenIcon } from "./icons";
import { Picture } from "./Picture";

export interface Tile {
  path: string;
  title: string;
  visibility: Visibility;
  thumbnail: MediaSet | null;
  externalUrl?: string | null;
}

interface AlbumGridProps {
  tiles: Tile[];
  showTitle: boolean;
  /** Photo tiles navigate with the History API inside GalleryView instead of a page load. */
  onOpenPhoto?: (path: string) => void;
}

const rowHeight = 240;
const defaultAspectRatio = 1;

/**
 * Justified rows without measuring the viewport: each tile grows in proportion to its aspect ratio
 * and wraps naturally, so the server and the client render the same markup.
 */
export function AlbumGrid({ tiles, showTitle, onOpenPhoto }: AlbumGridProps) {
  if (tiles.length === 0) return null;
  return (
    <div className="AlbumGrid">
      {tiles.map((tile) => {
        const aspectRatio = tile.thumbnail
          ? tile.thumbnail.fallback.width / tile.thumbnail.fallback.height
          : defaultAspectRatio;
        const style = {
          width: `${Math.round(aspectRatio * rowHeight)}px`,
          flexGrow: aspectRatio,
        };
        const content = (
          <>
            {tile.thumbnail ? (
              <Picture media={tile.thumbnail} alt={tile.title} loading="lazy" />
            ) : null}
            {tile.externalUrl ? (
              <div className="PictureTile-title">
                <LaunchIcon className="PictureTile-icon" />
                {tile.title}
              </div>
            ) : showTitle && tile.title ? (
              <div className="PictureTile-title">
                {tile.visibility === "public" ? (
                  tile.title
                ) : (
                  <>
                    <LockOpenIcon className="PictureTile-icon" />
                    <em>{tile.title}</em>
                  </>
                )}
              </div>
            ) : null}
          </>
        );
        if (tile.externalUrl) {
          return (
            <a
              key={tile.path}
              className="PictureTile"
              style={style}
              href={tile.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {content}
            </a>
          );
        }
        if (onOpenPhoto) {
          return (
            <a
              key={tile.path}
              className="PictureTile"
              style={style}
              href={tile.path}
              title={tile.title}
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.button !== 0
                )
                  return;
                event.preventDefault();
                onOpenPhoto(tile.path);
              }}
            >
              {content}
            </a>
          );
        }
        return (
          <Link
            key={tile.path}
            className="PictureTile"
            style={style}
            href={tile.path}
            title={tile.title}
            prefetch={false}
          >
            {content}
          </Link>
        );
      })}
      <i className="AlbumGrid-filler" aria-hidden="true" />
    </div>
  );
}
