"use client";

import { useState } from "react";

import type { ClientAlbumPage } from "@/gallery/types";
import type { Translations } from "@/translations";

import { DownloadDialog } from "./DownloadDialog";
import { DownloadIcon } from "./icons";

interface DownloadAlbumButtonProps {
  album: ClientAlbumPage;
  label: string;
  messages: {
    DownloadAlbumDialog: Translations["DownloadAlbumDialog"];
    Download: Translations["Download"];
  };
}

export function DownloadAlbumButton({
  album,
  label,
  messages,
}: DownloadAlbumButtonProps) {
  const [show, setShow] = useState(false);
  return (
    <>
      <button
        type="button"
        className="btn btn-link btn-sm"
        onClick={() => setShow(true)}
      >
        <DownloadIcon className="BreadcrumbBar-icon" />
        {label}…
      </button>
      <DownloadDialog
        album={album}
        photo={null}
        show={show}
        onHide={() => setShow(false)}
        messages={{
          dialog: messages.DownloadAlbumDialog,
          Download: messages.Download,
        }}
      />
    </>
  );
}
