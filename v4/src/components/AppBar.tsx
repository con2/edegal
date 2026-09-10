"use client";

import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

import type { Crumb } from "@/gallery/types";
import type { Viewer } from "@/gallery/viewer";
import type { Translations } from "@/translations";

interface AppBarProps {
  rootAlbum: Crumb;
  viewer: Viewer;
  messages: { AppBar: Translations["AppBar"]; Auth: Translations["Auth"] };
}

export function AppBar({ rootAlbum, viewer, messages }: AppBarProps) {
  return (
    <Navbar variant="dark" className="AppBar" expand="sm">
      <Container fluid>
        <Navbar.Brand as={Link} href={rootAlbum.path}>
          {rootAlbum.title}
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="AppBar-nav" />
        <Navbar.Collapse id="AppBar-nav">
          <Nav className="me-auto">
            <Nav.Item>
              <Nav.Link as={Link} href="/random" prefetch={false}>
                {messages.AppBar.randomPicture}
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Nav>
            {viewer.kind === "user" ? (
              <>
                <Navbar.Text className="me-3">
                  {messages.Auth.signedInAs} {viewer.name}
                </Navbar.Text>
                <Nav.Item>
                  <Nav.Link onClick={() => signOut()}>
                    {messages.Auth.signOut}
                  </Nav.Link>
                </Nav.Item>
              </>
            ) : (
              <Nav.Item>
                <Nav.Link onClick={() => signIn("kompassi")}>
                  {messages.Auth.signIn}
                </Nav.Link>
              </Nav.Item>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
