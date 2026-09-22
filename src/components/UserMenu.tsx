"use client";

import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";

import type { Viewer } from "@/gallery/viewer";
import type { Translations } from "@/translations";

interface UserMenuProps {
  viewer: Viewer;
  messages: { Auth: Translations["Auth"]; AppBar: Translations["AppBar"] };
}

/** Same shape as larpit.fi: the user's name opens a dropdown with their pages and sign out. */
export function UserMenu({ viewer, messages }: UserMenuProps) {
  if (viewer.kind !== "user") {
    return (
      <Nav.Link onClick={() => signIn("kompassi")}>
        {messages.Auth.signIn}…
      </Nav.Link>
    );
  }
  return (
    <NavDropdown
      title={viewer.name ?? <em>{messages.Auth.signedInAs}</em>}
      id="user-menu"
      data-bs-theme="light"
      align="end"
    >
      {viewer.isPhotographer ? (
        <>
          <NavDropdown.Item as={Link} href="/profile">
            {messages.AppBar.profile}
          </NavDropdown.Item>
          <NavDropdown.Divider />
        </>
      ) : null}
      {viewer.isAdmin ? (
        <>
          <NavDropdown.Item as={Link} href="/manage">
            {messages.AppBar.adminLink}
          </NavDropdown.Item>
          <NavDropdown.Divider />
        </>
      ) : null}
      <NavDropdown.Item onClick={() => signOut()}>
        {messages.Auth.signOut}
      </NavDropdown.Item>
    </NavDropdown>
  );
}
