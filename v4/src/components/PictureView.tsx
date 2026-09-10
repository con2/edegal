"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
  MoreIcon,
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

export function PictureView({
  album,
  index,
  messages,
  onNavigate,
  editor,
}: PictureViewProps) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const photo = album.photos[index];
  const previous = album.photos[index - 1];
  const next = album.photos[index + 1];
  const [downloadOpen, setDownloadOpen] = useState(false);
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
  }, [album.path, photo.path, previous, next, onNavigate, downloadOpen]);

  const preview = photo.preview ?? photo.thumbnail;

  return (
    <div className="PictureView">
      <Picture
        media={preview}
        alt={photo.title}
        className="PictureView-img"
        loading="eager"
      />

      {navLink(
        previous,
        "PictureView-nav PictureView-nav-previous",
        messages.PictureView.previousPicture,
        onNavigate,
        <ChevronLeftIcon className="PictureView-icon" />,
      )}
      {navLink(
        next,
        "PictureView-nav PictureView-nav-next",
        messages.PictureView.nextPicture,
        onNavigate,
        <ChevronRightIcon className="PictureView-icon" />,
      )}

      <a
        href={album.path}
        className="PictureView-action PictureView-action-exit"
        title={messages.PictureView.backToAlbum}
        onClick={(event) => {
          event.preventDefault();
          onNavigate(album.path, "push");
        }}
      >
        <CloseIcon className="PictureView-icon" />
      </a>

      {editor ? (
        <Dropdown
          className="PictureView-action PictureView-action-menu"
          align="end"
        >
          <Dropdown.Toggle
            variant="link"
            className="p-0 border-0 text-reset"
            title={editor.messages.photoActions}
            disabled={busy}
          >
            <MoreIcon className="PictureView-icon" />
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
                {target.isOwnAlbum
                  ? editor.messages.setAsThumbnail
                  : editor.messages.setAsThumbnailOf.replace(
                      "{album}",
                      target.title,
                    )}
              </Dropdown.Item>
            ))}
            {editor.setProfilePhoto ? (
              <Dropdown.Item
                as="button"
                onClick={() => {
                  const setProfilePhoto = editor.setProfilePhoto;
                  if (!setProfilePhoto) return;
                  startTransition(() => setProfilePhoto(photo.id));
                }}
              >
                {editor.messages.setAsProfilePhoto}
              </Dropdown.Item>
            ) : null}
            {editor.manage ? (
              <>
                <Dropdown.Divider />
                <Dropdown.Item
                  as="button"
                  className="text-danger"
                  onClick={() => {
                    const manage = editor.manage;
                    if (!manage) return;
                    if (!window.confirm(editor.messages.confirmDeletePhoto))
                      return;
                    startTransition(() => manage.deletePhoto(photo.id));
                  }}
                >
                  {editor.messages.deletePhoto}
                </Dropdown.Item>
              </>
            ) : null}
          </Dropdown.Menu>
        </Dropdown>
      ) : null}

      {downloadable ? (
        <>
          <button
            type="button"
            className="PictureView-action PictureView-action-download btn p-0 border-0 bg-transparent"
            title={messages.PictureView.downloadOriginal}
            onClick={() => setDownloadOpen(true)}
          >
            <DownloadIcon className="PictureView-icon" />
          </button>
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
        </>
      ) : null}
    </div>
  );
}
