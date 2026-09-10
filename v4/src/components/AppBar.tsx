"use client";

import { LanguageSwitcher } from "@con2/components";
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
  locale: string;
  messages: Pick<Translations, "AppBar" | "Auth" | "LanguageSwitcher">;
}

export function AppBar({ rootAlbum, viewer, locale, messages }: AppBarProps) {
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
              {/* A plain link: the router would cache the redirect and keep showing one picture. */}
              <Nav.Link href="/random">
                {messages.AppBar.randomPicture}
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Nav>
            <LanguageSwitcher
              locale={locale}
              messages={messages.LanguageSwitcher}
            />
            {viewer.kind === "user" && viewer.isPhotographer ? (
              <Nav.Item>
                <Nav.Link as={Link} href="/profile">
                  {messages.AppBar.profile}
                </Nav.Link>
              </Nav.Item>
            ) : null}
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
