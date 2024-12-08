"use client";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Link from "next/link";

import type { Translations } from "@/translations/en";
import { loginUrl } from "@/config";
import Album from "@/models/Album";

import "./index.scss";

interface NavLinkProps {
  path: string;
  title: string;
  isActive?: boolean;
}

function NavLink({ path, title, isActive }: NavLinkProps) {
  return (
    <Nav.Item key={path}>
      <Nav.Link active={!!isActive} as={Link} href={path}>
        {title}
      </Nav.Link>
    </Nav.Item>
  );
}

interface Props {
  album: Album;
  messages: Translations["AppBar"];
}

export default function AppBar({ messages: t, album }: Props) {
  const { path, title } = album;
  const rootAlbum = album.breadcrumb[0] || { path, title };

  return (
    <Navbar variant="dark" className="AppBar" expand="sm">
      <Container fluid>
        <Navbar.Brand as={Link} href={rootAlbum.path}>
          {rootAlbum.title}
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="AppBar-nav" />
        <Navbar.Collapse id="AppBar-nav">
          <Nav className="me-auto">
            <NavLink
              path="/photographers"
              title={t.photographers}
              isActive={path.startsWith("/photographers")}
            />
            <NavLink path="/random" title={t.randomPicture} />
          </Nav>
          <Nav>
            <Nav.Item>
              <Nav.Link href={loginUrl}>{t.adminLink}</Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
