import React from 'react';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

import Config from '../../Config';
import Album from '../../models/Album';
import { T } from '../../translations';

import './index.scss';
import { Link } from 'react-router-dom';

function NavLink({
  path,
  title,
  isActive,
}: {
  path: string;
  title: string;
  isActive?: boolean;
}): JSX.Element {
  return (
    <Nav.Item key={path}>
      <Nav.Link active={!!isActive} as={Link} to={path}>
        {title}
      </Nav.Link>
    </Nav.Item>
  );
}

function AppBar({ album }: { album: Album }): JSX.Element {
  const t = T(r => r.AppBar);
  const { path, title } = album;
  const rootAlbum = album.breadcrumb[0] || { path, title };

  return (
    <Navbar variant="dark" className="AppBar" expand="sm">
      <Container fluid>
        <Navbar.Brand as={Link} to={rootAlbum.path}>
          {rootAlbum.title}
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="AppBar-nav" />
        <Navbar.Collapse id="AppBar-nav">
          <Nav className="me-auto">
            <NavLink
              path="/photographers"
              title={t(r => r.photographers)}
              isActive={path.startsWith('/photographers')}
            />
            <NavLink path="/random" title={t(r => r.randomPicture)} />
          </Nav>
          <Nav>
            <Nav.Item>
              <Nav.Link href={Config.loginUrl}>{t(r => r.adminLink)}</Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppBar;
