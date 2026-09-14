"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CSSProperties, useEffect, useState, useTransition } from "react";
import Dropdown from "react-bootstrap/Dropdown";

import { canDownload } from "@/gallery/access";
import type { ThumbnailTarget } from "@/editor/albums";
import type { ClientAlbumPage, PhotoVM } from "@/gallery/types";
import type { Translations } from "@/translations";

import { DownloadDialog } from "./DownloadDialog";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DownloadIcon,
} from "./icons";
import { Picture } from "./Picture";

export interface PhotoEditor {
  /** Albums whose thumbnail this photo may become; one menu item each. */
  thumbnailTargets: ThumbnailTarget[];
  setThumbnail: (albumId: string, photoId: string) => Promise<void>;
  /** Present when the viewer may manage this album's photos. */
  manage: {
    deletePhoto: (photoId: string) => Promise<void>;
  } | null;
  /** Present for signed-in photographers: any photo, by anyone, may become their profile photo. */
  setProfilePhoto: ((photoId: string) => Promise<void>) | null;
  messages: Translations["Editor"];
}

interface PictureViewProps {
  album: ClientAlbumPage;
  index: number;
  messages: Pick<Translations, "PictureView" | "DownloadDialog" | "Download">;
  onNavigate: (path: string, mode: "push" | "replace") => void;
  /** Present when the viewer has at least one action available on photos. */
  editor: PhotoEditor | null;
}

type Direction = "next" | "previous" | "album";

const keyMap: Record<string, Direction> = {
  Escape: "album",
  PageUp: "previous",
  PageDown: "next",
  ArrowLeft: "previous",
  ArrowRight: "next",
};

const slideshowMilliseconds = 3000;

/** Warms the browser cache for a neighbouring preview without attaching anything to the DOM. */
function preload(photo: PhotoVM | undefined) {
  if (!photo?.preview) return;
  const picture = document.createElement("picture");
  for (const alternate of photo.preview.alternates) {
    const source = document.createElement("source");
    source.type = `image/${alternate.format}`;
    source.srcset = alternate.src;
    picture.appendChild(source);
  }
  const img = document.createElement("img");
  picture.appendChild(img);
  img.src = photo.preview.fallback.src;
}

function navLink(
  photo: PhotoVM | undefined,
  className: string,
  title: string,
  onNavigate: PictureViewProps["onNavigate"],
  icon: React.ReactNode,
) {
  if (!photo) return null;
  return (
    <a
      href={photo.path}
      className={className}
      title={title}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(photo.path, "replace");
      }}
    >
      {icon}
    </a>
  );
}

interface PhotoToolbarProps {
  album: ClientAlbumPage;
  photo: PhotoVM;
  downloadable: boolean;
  onDownload: () => void;
  editor: PhotoEditor | null;
  messages: Translations["PictureView"];
  onNavigate: PictureViewProps["onNavigate"];
}

function PhotoToolbar({
  album,
  photo,
  downloadable,
  onDownload,
  editor,
  messages,
  onNavigate,
}: PhotoToolbarProps) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  return (
    <nav className="PictureView-toolbar">
      <a
        href={album.path}
        className="btn btn-link btn-sm"
        onClick={(event) => {
          event.preventDefault();
          onNavigate(album.path, "push");
        }}
      >
        <CloseIcon className="PictureView-toolbarIcon" />
        {messages.backToAlbum}
      </a>
      {downloadable ? (
        <button
          type="button"
          className="btn btn-link btn-sm"
          onClick={onDownload}
        >
          <DownloadIcon className="PictureView-toolbarIcon" />
          {messages.downloadOriginal}…
        </button>
      ) : null}
      {editor && editor.thumbnailTargets.length > 0 ? (
        <Dropdown className="d-inline-block" data-bs-theme="light">
          <Dropdown.Toggle variant="link" size="sm" disabled={busy}>
            {editor.messages.useAsThumbnail}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {editor.thumbnailTargets.map((target) => (
              <Dropdown.Item
                key={target.albumId}
                as="button"
                onClick={() =>
                  startTransition(async () => {
                    await editor.setThumbnail(target.albumId, photo.id);
                    router.refresh();
                  })
                }
              >
                {target.isOwnAlbum ? editor.messages.thisAlbum : target.title}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      ) : null}
      {editor?.setProfilePhoto ? (
        <button
          type="button"
          className="btn btn-link btn-sm"
          disabled={busy}
          onClick={() => {
            const setProfilePhoto = editor.setProfilePhoto;
            if (!setProfilePhoto) return;
            startTransition(() => setProfilePhoto(photo.id));
          }}
        >
          {editor.messages.setAsProfilePhoto}
        </button>
      ) : null}
      {editor?.manage ? (
        <button
          type="button"
          className="btn btn-link btn-sm text-danger"
          disabled={busy}
          onClick={() => {
            const manage = editor.manage;
            if (!manage) return;
            if (!window.confirm(editor.messages.confirmDeletePhoto)) return;
            startTransition(() => manage.deletePhoto(photo.id));
          }}
        >
          {editor.messages.deletePhoto}…
        </button>
      ) : null}
    </nav>
  );
}

function Credit({ album, photo }: { album: ClientAlbumPage; photo: PhotoVM }) {
  const holders = album.credits.filter((c) => c.isCopyright);
  if (holders.length === 0) return <footer className="PictureView-credit" />;
  const year = (photo.takenAt ?? album.date ?? "").slice(0, 4);
  return (
    <footer className="PictureView-credit">
      &copy; {year}{" "}
      {holders.map((holder, index) => (
        <span key={holder.displayName}>
          {index > 0 ? ", " : null}
          {holder.path ? (
            <Link href={holder.path}>{holder.displayName}</Link>
          ) : (
            holder.displayName
          )}
        </span>
      ))}
    </footer>
  );
}

export function PictureView({
  album,
  index,
  messages,
  onNavigate,
  editor,
}: PictureViewProps) {
  const photo = album.photos[index];
  const previous = album.photos[index - 1];
  const next = album.photos[index + 1];
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const downloadable = canDownload(album) && photo.original !== null;

  useEffect(() => {
    const timer = setTimeout(() => {
      preload(previous);
      preload(next);
    }, 0);
    return () => clearTimeout(timer);
  }, [previous, next]);

  useEffect(() => {
    // Keyboard shortcuts belong to the picture, not to an open dialog.
    if (downloadOpen) return;
    const slideshow = new URLSearchParams(window.location.search).has(
      "slideshow",
    );
    const go = (direction: Direction, keepSlideshow = false) => {
      const target =
        direction === "album"
          ? album.path
          : direction === "next"
            ? next?.path
            : previous?.path;
      if (!target) return;
      const suffix = keepSlideshow ? "?slideshow" : "";
      onNavigate(target + suffix, direction === "album" ? "push" : "replace");
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "r" || event.key === "R") {
        // Full navigation on purpose: the router caches the redirect and would repeat one picture.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/random");
        return;
      }
      if (event.key === "s" || event.key === "S") {
        onNavigate(`${photo.path}?slideshow`, "replace");
        return;
      }
      if (event.code === "Escape" && maximized) {
        setMaximized(false);
        return;
      }
      const direction = keyMap[event.code];
      if (direction) go(direction);
    };
    document.addEventListener("keydown", onKeyDown);
    const slideshowTimer =
      slideshow && next
        ? setTimeout(() => go("next", true), slideshowMilliseconds)
        : null;
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (slideshowTimer) clearTimeout(slideshowTimer);
    };
  }, [
    album.path,
    photo.path,
    previous,
    next,
    onNavigate,
    downloadOpen,
    maximized,
  ]);

  const preview = photo.preview ?? photo.thumbnail;
  const photoStyle = {
    "--PictureView-ratio": `${preview.fallback.width} / ${preview.fallback.height}`,
  } as CSSProperties;

  return (
    <>
      <div
        className={`PictureView${maximized ? " PictureView-maximized" : ""}`}
        onClick={maximized ? () => setMaximized(false) : undefined}
      >
        {maximized ? null : (
          <PhotoToolbar
            album={album}
            photo={photo}
            downloadable={downloadable}
            onDownload={() => setDownloadOpen(true)}
            editor={editor}
            messages={messages.PictureView}
            onNavigate={onNavigate}
          />
        )}

        {maximized
          ? null
          : navLink(
              previous,
              "PictureView-nav PictureView-nav-previous",
              messages.PictureView.previousPicture,
              onNavigate,
              <ChevronLeftIcon className="PictureView-icon" />,
            )}

        <div className="PictureView-stage">
          <button
            type="button"
            className="PictureView-photo"
            style={photoStyle}
            title={
              maximized
                ? messages.PictureView.exitMaximized
                : messages.PictureView.maximize
            }
            onClick={() => setMaximized((current) => !current)}
          >
            <Picture media={preview} alt={photo.title} loading="eager" />
          </button>
        </div>

        {maximized
          ? null
          : navLink(
              next,
              "PictureView-nav PictureView-nav-next",
              messages.PictureView.nextPicture,
              onNavigate,
              <ChevronRightIcon className="PictureView-icon" />,
            )}

        {maximized ? null : <Credit album={album} photo={photo} />}
      </div>

      {downloadable ? (
        <DownloadDialog
          album={album}
          photo={photo}
          show={downloadOpen}
          onHide={() => setDownloadOpen(false)}
          messages={{
            dialog: messages.DownloadDialog,
            Download: messages.Download,
          }}
        />
      ) : null}
    </>
  );
}
