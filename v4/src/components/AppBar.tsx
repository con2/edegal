"use client";

import { LanguageSwitcher } from "@con2/components";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

import type { Crumb } from "@/gallery/types";
import type { Viewer } from "@/gallery/viewer";
import type { Translations } from "@/translations";

import { UserMenu } from "./UserMenu";

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
              <Nav.Link as={Link} href="/photographers">
                {messages.AppBar.photographers}
              </Nav.Link>
            </Nav.Item>
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
            <UserMenu
              viewer={viewer}
              messages={{ Auth: messages.Auth, AppBar: messages.AppBar }}
            />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
