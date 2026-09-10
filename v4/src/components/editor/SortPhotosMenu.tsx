"use client";

import { useTransition } from "react";
import Dropdown from "react-bootstrap/Dropdown";

import type { Translations } from "@/translations";

interface SortPhotosMenuProps {
  /** Bound server actions; each redirects back to the album when done. */
  sortByCaptureTime: () => Promise<void>;
  sortByFilename: () => Promise<void>;
  messages: Translations["Editor"];
}

export function SortPhotosMenu({
  sortByCaptureTime,
  sortByFilename,
  messages,
}: SortPhotosMenuProps) {
  const [busy, startTransition] = useTransition();
  return (
    <Dropdown className="d-inline-block" data-bs-theme="light">
      <Dropdown.Toggle
        variant="link"
        size="sm"
        className="btn-link"
        disabled={busy}
      >
        {messages.sortPhotos}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item
          as="button"
          onClick={() => startTransition(sortByCaptureTime)}
        >
          {messages.sortByCaptureTime}
        </Dropdown.Item>
        <Dropdown.Item
          as="button"
          onClick={() => startTransition(sortByFilename)}
        >
          {messages.sortByFilename}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
