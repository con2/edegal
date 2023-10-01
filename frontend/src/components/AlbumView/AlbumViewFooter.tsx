import React from 'react';
import { createPortal } from 'react-dom';

import Album from '../../models/Album';
import { T } from '../../translations';
import Link from "next/link";

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
          {t(r => r.albumCopyright)} &copy; {getYear(album)}{' '}
          <Link href={photographer.path}>{photographer.display_name}</Link>.{' '}
        </>
      ) : null}
      Edegal &copy; 2010–2022 <a href="https://github.com/con2/edegal">Santtu Pajukanta</a>.
    </footer>,
    document.body
  );
};

export default AlbumViewFooter;
