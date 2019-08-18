import React from 'react';
import { useTranslation } from 'react-i18next';

import Album from '../../models/Album';

const getYear = (album: Album) => (album.date ? new Date(album.date).getUTCFullYear() : '');

interface FooterProps {
  album: Album;
}

const AlbumViewFooter: React.FC<FooterProps> = ({ album }) => {
  const { t } = useTranslation('AlbumViewFooter');
  const { photographer } = album.credits;

  // TODO: Have the footer stay at the bottom of the page
  return (
    <footer className="AlbumViewFooter mt-3 mb-1">
      {photographer ? (
        <>
          {t('albumCopyright')} &copy; {getYear(album)} {photographer.display_name}.{' '}
        </>
      ) : null}
      <a href="https://github.com/conikuvat/edegal">Edegal</a> &copy; 2010–2019 Santtu Pajukanta.
    </footer>
  );
};

export default AlbumViewFooter;
