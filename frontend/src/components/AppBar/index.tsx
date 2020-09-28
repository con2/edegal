import React from 'react';

import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import Config from '../../Config';
import Album from '../../models/Album';
import { T } from '../../translations';

import './index.scss';
import Container from 'react-bootstrap/Container';

function AppBar({ album }: { album: Album }): JSX.Element {
  const t = T(r => r.AppBar);
  const { path, title } = album;
  const navLinks = [
    {
      path: '/photographers',
      title: t(r => r.photographers),
    },
    {
      path: '/random',
      title: t(r => r.randomPicture),
    },
  ];

  const rootAlbum = album.breadcrumb[0] || { path, title };

  return (
    <Navbar variant="dark" className="AppBar" expand="lg">
      <Container>
        <LinkContainer to={rootAlbum.path}>
          <Navbar.Brand href="#home">{rootAlbum.title}</Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            {/* Root or otherwise magical album. Show nav links. */}
            {navLinks.map(item => {
              const isActive = path === item.path;

              return (
                <Nav.Item key={item.path}>
                  <LinkContainer to={item.path}>
                    <Nav.Link active={isActive}>{item.title}</Nav.Link>
                  </LinkContainer>
                </Nav.Item>
              );
            })}
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
