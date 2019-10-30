import React from 'react';
import { createPortal } from 'react-dom';

import Album from '../../models/Album';
import { T } from '../../translations';
import { Link } from 'react-router-dom';

const getYear = (album: Album) => (album.date ? new Date(album.date).getUTCFullYear() : '');

interface FooterProps {
  album: Album;
}

const AlbumViewFooter: React.FC<FooterProps> = ({ album }) => {
  const t = T(r => r.AlbumViewFooter);
  const { photographer } = album.credits;

  return createPortal(
    <footer className="AlbumViewFooter">
      {photographer ? (
        <>
          {t(r => r.albumCopyright)} &copy; {getYear(album)} <Link to={photographer.path}>{photographer.display_name}</Link>.{' '}
        </>
      ) : null}
      <a href="https://github.com/conikuvat/edegal">Edegal</a> &copy; 2010–2019 Santtu Pajukanta.
    </footer>,
    document.body,
  );
};

export default AlbumViewFooter;
