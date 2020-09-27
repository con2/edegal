import React from 'react';

import { LinkContainer } from 'react-router-bootstrap';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import Config from '../../Config';
import Album from '../../models/Album';
import { T, TranslationFunction } from '../../translations';
import Breadcrumb from '../../models/Breadcrumb';

import './index.css';

const breadcrumbSeparator = ' » ';

export interface AppBarAction {
  label: string;
  onClick?(): void;
  href?: string;
}

export interface AppBarProps {
  album: Album;
  actions?: AppBarAction[];
}

function getBreadcrumbTitle(breadcrumb: Breadcrumb, t: TranslationFunction<{ photographers: string; timeline: string }>) {
  if (breadcrumb.path === '/photographers') {
    return t(r => r.photographers);
  } else if (breadcrumb.path.endsWith('/timeline')) {
    return t(r => r.timeline);
  } else {
    return breadcrumb.title;
  }
}

const AppBar: React.FC<AppBarProps> = ({ album, actions }) => {
  const t = T(r => r.AppBar);
  const { path, title, breadcrumb } = album;
  const fullBreadcrumb = breadcrumb.concat([{ path, title }]);
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
  const showNavLinks = path === '/' || navLinks.some(link => path === link.path);

  document.title = fullBreadcrumb.map(crumb => getBreadcrumbTitle(crumb, t)).join(breadcrumbSeparator);

  const rootAlbum = fullBreadcrumb.shift();

  return (
    <Navbar variant="dark" className="AppBar" expand="lg">
      <LinkContainer to={rootAlbum!.path}>
        <Navbar.Brand href="#home">{rootAlbum!.title}</Navbar.Brand>
      </LinkContainer>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        {showNavLinks ? (
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
        ) : (
          <Nav className="mr-auto">
            {/* Non-root album. Show breadcrumb. */}
            {fullBreadcrumb.map((item, index) => {
              const isActive = index === fullBreadcrumb.length - 1;
              return (
                <Nav.Item key={item.path}>
                  <LinkContainer to={item.path}>
                    <Nav.Link active={isActive}>
                      {breadcrumbSeparator}
                      {getBreadcrumbTitle(item, t)}
                    </Nav.Link>
                  </LinkContainer>
                </Nav.Item>
              );
            })}
          </Nav>
        )}

        <Nav>
          {(actions || []).map(action => {
            const { onClick, href, label } = action;

            // TODO emfancify types instead of runtime check :)
            if (onClick) {
              if (href) {
                console.warn('Both onClick and href specified for AppBarAction (onClick prevails)', { href, label });
              }

              return (
                <Nav.Item>
                  <Button variant="link" className="nav-link" onClick={onClick}>
                    {label}
                  </Button>
                </Nav.Item>
              );
            } else {
              if (!href) {
                console.warn('Neither onClick nor href specified for AppBarAction (does nothing)', { label });
              }

              return (
                <Nav.Item>
                  <LinkContainer to={href || ''}>
                    <Nav.Link>{label}</Nav.Link>
                  </LinkContainer>
                </Nav.Item>
              );
            }
          })}
          <Nav.Item>
            <Nav.Link href={Config.loginUrl}>{t(r => r.adminLink)}</Nav.Link>
          </Nav.Item>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default AppBar;
