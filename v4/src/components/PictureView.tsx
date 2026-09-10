"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { ClientAlbumPage, PhotoVM } from "@/gallery/types";
import type { Translations } from "@/translations";

import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./icons";
import { Picture } from "./Picture";

interface PictureViewProps {
  album: ClientAlbumPage;
  index: number;
  messages: Translations["PictureView"];
  onNavigate: (path: string, mode: "push" | "replace") => void;
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
}: PictureViewProps) {
  const router = useRouter();
  const photo = album.photos[index];
  const previous = album.photos[index - 1];
  const next = album.photos[index + 1];

  useEffect(() => {
    const timer = setTimeout(() => {
      preload(previous);
      preload(next);
    }, 0);
    return () => clearTimeout(timer);
  }, [previous, next]);

  useEffect(() => {
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
        router.push("/random");
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
  }, [album.path, photo.path, previous, next, onNavigate, router]);

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
        messages.previousPicture,
        onNavigate,
        <ChevronLeftIcon className="PictureView-icon" />,
      )}
      {navLink(
        next,
        "PictureView-nav PictureView-nav-next",
        messages.nextPicture,
        onNavigate,
        <ChevronRightIcon className="PictureView-icon" />,
      )}

      <a
        href={album.path}
        className="PictureView-action PictureView-action-exit"
        title={messages.backToAlbum}
        onClick={(event) => {
          event.preventDefault();
          onNavigate(album.path, "push");
        }}
      >
        <CloseIcon className="PictureView-icon" />
      </a>
    </div>
  );
}
