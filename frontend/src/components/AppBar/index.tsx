import React from 'react';

import Config from '../../Config';
import Album from '../../models/Album';
import { T } from '../../translations';

import './index.scss';
import Link from 'next/link';

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
    <div className="nav-item" key={path}>
      <Link className="nav-link" href={path}>
        {title}
      </Link>
    </div>
  );
}

function AppBar({ album }: { album: Album }): JSX.Element {
  const t = T(r => r.AppBar);
  const { path, title } = album;
  const rootAlbum = album.breadcrumb[0] || { path, title };

  return (
    <div className="navbar navbar-dark AppBar">
      <div className="container container-fluid">
        <Link className="navbar-brand" href={rootAlbum.path}>
          {rootAlbum.title}
        </Link>

        {/* <Navbar.Toggle aria-controls="AppBar-nav" /> */}
        {/* TODO navbar-collapse */}
        <div className="AppBar-nav">
          <div className="nav navbar-nav me-auto">
            <NavLink
              path="/photographers"
              title={t(r => r.photographers)}
              isActive={path.startsWith('/photographers')}
            />
            <NavLink path="/random" title={t(r => r.randomPicture)} />
            <NavLink path={Config.loginUrl} title={t(r => r.adminLink)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppBar;
