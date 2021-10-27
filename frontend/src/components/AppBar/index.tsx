import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import Config from '../../Config';
import Album from '../../models/Album';
import { T } from '../../translations';

import './index.scss';

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
      <LinkContainer to={path}>
        <Nav.Link active={!!isActive}>{title}</Nav.Link>
      </LinkContainer>
    </Nav.Item>
  );
}

function AppBar({ album }: { album: Album }): JSX.Element {
  const t = T(r => r.AppBar);
  const { path, title } = album;
  const rootAlbum = album.breadcrumb[0] || { path, title };

  return (
    <Navbar variant="dark" className="AppBar" expand="sm">
      <LinkContainer to={rootAlbum.path}>
        <Navbar.Brand href="#home">{rootAlbum.title}</Navbar.Brand>
      </LinkContainer>

      <Navbar.Toggle aria-controls="AppBar-nav" />
      <Navbar.Collapse id="AppBar-nav">
        <Nav className="mr-auto">
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
    </Navbar>
  );
}

export default AppBar;
