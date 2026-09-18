"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Dropdown from "react-bootstrap/Dropdown";

import { canDownload } from "@/gallery/access";
import type { ThumbnailTarget } from "@/editor/albums";
import type { ClientAlbumPage, PhotoVM } from "@/gallery/types";
import type { Translations } from "@/translations";

import { ContactDialog } from "./ContactDialog";
import { DownloadDialog } from "./DownloadDialog";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DownloadIcon,
  MailIcon,
  PauseIcon,
  PlayIcon,
} from "./icons";
import { Picture } from "./Picture";
import { usePictureDrag } from "./usePictureDrag";

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
  messages: Pick<
    Translations,
    "PictureView" | "DownloadDialog" | "Download" | "ContactDialog"
  >;
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

type Slot = "previous" | "current" | "next";

function slide(photo: PhotoVM | undefined, slot: Slot) {
  if (!photo) return null;
  const preview = photo.preview ?? photo.thumbnail;
  const style = {
    "--PictureView-ratio": `${preview.fallback.width} / ${preview.fallback.height}`,
  } as CSSProperties;
  return (
    <div
      key={photo.path}
      className={`PictureView-slide PictureView-slide-${slot}`}
    >
      <div className="PictureView-photo" style={style}>
        <Picture
          media={preview}
          alt={photo.title}
          loading="eager"
          fetchPriority={slot === "current" ? "high" : "low"}
        />
      </div>
    </div>
  );
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
  slideshow: boolean;
  onDownload: () => void;
  /** Absent when nobody credited for the album can be contacted. */
  onContact: (() => void) | null;
  onToggleSlideshow: () => void;
  editor: PhotoEditor | null;
  messages: Translations["PictureView"];
  onNavigate: PictureViewProps["onNavigate"];
}

function PhotoToolbar({
  album,
  photo,
  downloadable,
  slideshow,
  onDownload,
  onContact,
  onToggleSlideshow,
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
      <button
        type="button"
        className="btn btn-link btn-sm"
        onClick={onToggleSlideshow}
      >
        {slideshow ? (
          <PauseIcon className="PictureView-toolbarIcon" />
        ) : (
          <PlayIcon className="PictureView-toolbarIcon" />
        )}
        {messages.slideshow}
      </button>
      {downloadable ? (
        <button
          type="button"
          className="btn btn-link btn-sm"
          onClick={onDownload}
        >
          <DownloadIcon className="PictureView-toolbarIcon" />
          {messages.downloadPicture}…
        </button>
      ) : null}
      {onContact ? (
        <button
          type="button"
          className="btn btn-link btn-sm"
          onClick={onContact}
        >
          <MailIcon className="PictureView-toolbarIcon" />
          {messages.contactPhotographer}…
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
            if (!window.confirm(editor.messages.confirmSetProfilePhoto)) return;
            startTransition(() => setProfilePhoto(photo.id));
          }}
        >
          {editor.messages.setAsProfilePhoto}
        </button>
      ) : null}
      {editor?.manage ? (
        <button
          type="button"
          className="btn btn-link btn-sm"
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
  const [contactOpen, setContactOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  // The URL carries the slideshow flag so that it can be linked to; Next keeps the hook in
  // sync with our own replaceState calls.
  const slideshow = useSearchParams().has("slideshow");
  const downloadable =
    canDownload(album) && (photo.original !== null || photo.preview !== null);

  const toggleSlideshow = useCallback(
    () =>
      onNavigate(slideshow ? photo.path : `${photo.path}?slideshow`, "replace"),
    [slideshow, photo.path, onNavigate],
  );

  const go = useCallback(
    (direction: Direction, keepSlideshow = false) => {
      const target =
        direction === "album"
          ? album.path
          : direction === "next"
            ? next?.path
            : previous?.path;
      if (!target) return;
      const suffix = keepSlideshow ? "?slideshow" : "";
      onNavigate(target + suffix, direction === "album" ? "push" : "replace");
    },
    [album.path, next, previous, onNavigate],
  );

  const dialogOpen = downloadOpen || contactOpen;

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const enterFullscreen = useCallback(() => {
    setFullscreen(true);
    rootRef.current?.requestFullscreen().catch(() => {});
  }, []);

  const exitFullscreen = useCallback(() => {
    setFullscreen(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    // The browser can leave fullscreen on its own (Escape, F11, swipe down on
    // mobile), bypassing exitFullscreen, so this is the state's real source of truth.
    const root = rootRef.current;
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      if (document.fullscreenElement === root) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    onTransitionEnd,
  } = usePictureDrag({
    stageRef,
    trackRef,
    hasPrevious: Boolean(previous),
    hasNext: Boolean(next),
    enabled: !dialogOpen,
    index,
    onCommit: go,
  });

  useEffect(() => {
    // Keyboard shortcuts belong to the picture, not to an open dialog.
    if (dialogOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "r" || event.key === "R") {
        // Full navigation on purpose: the router caches the redirect and would repeat one picture.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/random");
        return;
      }
      if (event.key === "s" || event.key === "S") {
        toggleSlideshow();
        return;
      }
      if (event.code === "Escape" && fullscreen) {
        exitFullscreen();
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
  }, [dialogOpen, fullscreen, next, slideshow, go, toggleSlideshow, exitFullscreen]);

  return (
    <>
      <div
        className={`PictureView${fullscreen ? " PictureView-fullscreen" : ""}`}
        ref={rootRef}
        onClick={fullscreen ? exitFullscreen : undefined}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
      >
        {fullscreen ? null : (
          <PhotoToolbar
            album={album}
            photo={photo}
            downloadable={downloadable}
            slideshow={slideshow}
            onDownload={() => setDownloadOpen(true)}
            onContact={album.contactable ? () => setContactOpen(true) : null}
            onToggleSlideshow={toggleSlideshow}
            editor={editor}
            messages={messages.PictureView}
            onNavigate={onNavigate}
          />
        )}

        {fullscreen
          ? null
          : navLink(
              previous,
              "PictureView-nav PictureView-nav-previous",
              messages.PictureView.previousPicture,
              onNavigate,
              <ChevronLeftIcon className="PictureView-icon" />,
            )}

        <div
          className="PictureView-stage"
          ref={stageRef}
          onClick={fullscreen ? undefined : enterFullscreen}
        >
          <div
            className="PictureView-track"
            ref={trackRef}
            onTransitionEnd={onTransitionEnd}
          >
            {slide(previous, "previous")}
            {slide(photo, "current")}
            {slide(next, "next")}
          </div>
        </div>

        {fullscreen
          ? null
          : navLink(
              next,
              "PictureView-nav PictureView-nav-next",
              messages.PictureView.nextPicture,
              onNavigate,
              <ChevronRightIcon className="PictureView-icon" />,
            )}

        {fullscreen ? null : <Credit album={album} photo={photo} />}
      </div>

      {downloadable ? (
        <DownloadDialog
          album={album}
          photo={photo}
          show={downloadOpen}
          onHide={() => setDownloadOpen(false)}
          onContactPhotographer={
            album.contactable ? () => setContactOpen(true) : undefined
          }
          messages={{
            dialog: messages.DownloadDialog,
            Download: messages.Download,
          }}
        />
      ) : null}
      {album.contactable ? (
        <ContactDialog
          album={album}
          photo={photo}
          show={contactOpen}
          onHide={() => setContactOpen(false)}
          messages={messages.ContactDialog}
        />
      ) : null}
    </>
  );
}
