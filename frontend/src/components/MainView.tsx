import React from 'react';

import AlbumView from './AlbumView';
import Loading from './Loading';
import PictureView from './PictureView';
import { Content, getAlbum } from '../helpers/getAlbum';
import { RouteComponentProps } from 'react-router';

const loadingViewDelayMillis = 500;

const MainView: React.FC<RouteComponentProps<{}>> = ({ location, history }) => {
  const path = location.pathname;
  const [loading, setLoading] = React.useState(true);
  const [content, setContent] = React.useState<Content | null>(null);

  React.useEffect(() => {
    // TODO: not exactly NodeJS, fix tsconfig
    let timeout: NodeJS.Timeout | null = null;

    (async () => {
      // Only show the loading indicator if the request is slow.
      timeout = setTimeout(() => setLoading(true), loadingViewDelayMillis);

      const content = await getAlbum(path);

      clearTimeout(timeout);
      setContent(content);
      setLoading(false);
    })();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [path]);

  if (loading || !content) {
    return <Loading />;
  } else {
    const { album, picture } = content;

    if (album.redirect_url) {
      if (album.redirect_url.indexOf('://') >= 0) {
        document.location.href = album.redirect_url;
      } else {
        setTimeout(() => history.push(album.redirect_url), 0);
      }

      return <Loading />;
    } else if (picture) {
      return <PictureView album={album} picture={picture} />;
    } else {
      return <AlbumView album={album} />;
    }
  }
};

export default MainView;
