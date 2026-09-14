"use client";

import Link from "next/link";
import Dropdown from "react-bootstrap/Dropdown";

import type { Translations } from "@/translations";

interface ImportAlbumMenuProps {
  albumPath: string;
  messages: Translations["Editor"];
}

/** Sources an album can be imported from as a link; each opens its own editor panel. */
export function ImportAlbumMenu({ albumPath, messages }: ImportAlbumMenuProps) {
  return (
    <Dropdown className="d-inline-block" data-bs-theme="light">
      <Dropdown.Toggle variant="link" size="sm" className="btn-link">
        {messages.importAlbum}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item as={Link} href={`${albumPath}?importFlickr=1`}>
          {messages.importFlickr}…
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
