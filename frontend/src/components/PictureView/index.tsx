"use client";

import React from "react";
import { useRouter } from "next/navigation";

import preloadMedia from "@/helpers/preloadMedia";
import Album from "@/models/Album";
import Picture from "@/models/Picture";
import replaceFormat from "@/helpers/replaceFormat";
import type { Translations } from "@/translations/en";

import DownloadDialog from "../DownloadDialog";
import ContactDialog from "../ContactDialog";

import "./index.css";

type Direction = "next" | "previous" | "album";
const keyMap: { [keyCode: string]: Direction } = {
  Escape: "album", //
  PageUp: "previous",
  PageDown: "next",
  ArrowLeft: "previous",
  ArrowRight: "next",
};

interface Props {
  album: Album;
  picture: Picture;
  messages: {
    PictureView: Translations["PictureView"];
    DownloadDialog: Translations["DownloadDialog"];
    ContactDialog: Translations["ContactDialog"];
  };
}

const slideshowMilliseconds = 3000;

export default function PictureView({ album, picture, messages }: Props) {
  const t = messages.PictureView;
  const { preview, title } = picture;
  const { src } = preview;
  const additionalFormats = preview.additional_formats ?? [];
  const [isDownloadDialogOpen, setDownloadDialogOpen] = React.useState(false);
  const [isContactDialogOpen, setContactDialogOpen] = React.useState(false);
  const fromAlbumView = false; // TODO
  const router = useRouter();

  const goTo = React.useCallback(
    (direction: Direction) => {
      // TODO hairy due to refactoring .album away from picture, ameliorate
      const destination =
        direction === "album" ? album.path : picture[direction];
      if (destination) {
        if (direction === "album") {
          if (fromAlbumView) {
            // arrived from album view
            // act as the browser back button
            router.back();
          } else {
            // arrived using direct link
            router.push(destination);
          }
        } else {
          router.replace(destination);
        }
      }
    },
    [album, picture, fromAlbumView, router]
  );

  const onKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (isDownloadDialogOpen || isContactDialogOpen) {
        return;
      }

      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (event.key === "r" || event.key === "R") {
        router.push("/random");
        return;
      } else if (event.key === "s" || event.key === "S") {
        startSlideshow();
        return;
      }

      const direction = keyMap[event.code];
      if (direction) {
        goTo(direction);
      }
    },
    [router, goTo, isDownloadDialogOpen, isContactDialogOpen]
  );

  const preloadPreviousAndNext = React.useCallback((picture: Picture) => {
    // use setTimeout to not block rendering of current picture – improves visible latency
    setTimeout(() => {
      if (picture.previous) {
        router.prefetch(picture.previous);
        preloadMedia(album, picture.previous);
      }

      if (picture.next) {
        router.prefetch(picture.next);
        preloadMedia(album, picture.next);
      }
    }, 0);
  }, []);

  const closeDownloadDialog = React.useCallback(() => {
    setTimeout(() => {
      setDownloadDialogOpen(false);
    }, 0);
  }, []);

  const openDownloadDialog = React.useCallback(() => {
    setDownloadDialogOpen(true);
  }, []);

  const contactPhotographer = React.useCallback(() => {
    setTimeout(() => {
      setDownloadDialogOpen(false);
      setContactDialogOpen(true);
    }, 0);
  }, []);

  const closeContactDialog = React.useCallback(() => {
    setContactDialogOpen(false);
  }, []);

  const downloadPicture = React.useCallback(() => {
    window.open(picture.original.src);
  }, [picture]);

  const startSlideshow = React.useCallback(() => {
    setTimeout(() => {
      // goTo("next", { slideshow: true }); // TODO slideshow
      goTo("next");
    }, slideshowMilliseconds);
  }, [goTo]);

  React.useEffect(() => {
    const isSlideshow = false; // TODO
    preloadPreviousAndNext(picture);
    document.addEventListener("keydown", onKeyDown);

    if (isSlideshow) {
      startSlideshow();
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  });

  return (
    <div className="PictureView">
      <picture className="PictureView-img">
        {additionalFormats.map((format) => (
          <source
            key={format}
            srcSet={replaceFormat(src, format)}
            type={`image/${format}`}
          />
        ))}
        <img src={src} alt={title} />
      </picture>

      {picture.previous ? (
        <div
          onClick={() => goTo("previous")}
          className="PictureView-nav PictureView-nav-previous"
          title={t.previousPicture}
        >
          {/* <svg className="PictureView-icon">
            <use xlinkHref={`${navigationIcons}#ic_chevron_left_24px`} />
          </svg> */}
          &laquo;
        </div>
      ) : null}

      {picture.next ? (
        <div
          onClick={() => goTo("next")}
          className="PictureView-nav PictureView-nav-next"
          title={t.nextPicture}
        >
          {/* <svg className="PictureView-icon">
            <use xlinkHref={`${navigationIcons}#ic_chevron_right_24px`} />
          </svg> */}
          &raquo;
        </div>
      ) : null}

      <div
        onClick={() => goTo("album")}
        className="PictureView-action PictureView-action-exit"
        title={t.backToAlbum}
      >
        {/* <svg className="PictureView-icon">
          <use xlinkHref={`${navigationIcons}#ic_close_24px`} />
        </svg> */}
        &times;
      </div>

      {album.is_downloadable && picture.original && (
        <>
          <div
            onClick={openDownloadDialog}
            className="PictureView-action PictureView-action-download"
            title={t.downloadOriginal}
          >
            {/* <svg className="PictureView-icon">
              <use xlinkHref={`${editorIcons}#ic_vertical_align_bottom_24px`} />
            </svg> */}
            💾
          </div>

          <DownloadDialog
            key={picture.path + "/download"}
            album={album}
            onAccept={downloadPicture}
            onClose={closeDownloadDialog}
            onContactPhotographer={contactPhotographer}
            isOpen={isDownloadDialogOpen}
            messages={messages.DownloadDialog}
          />
        </>
      )}
      {album.credits.photographer && (
        <ContactDialog
          key={picture.path + "/contact"}
          isOpen={isContactDialogOpen}
          onClose={closeContactDialog}
          album={album}
          picture={picture}
          messages={messages.ContactDialog}
        />
      )}
    </div>
  );
}
