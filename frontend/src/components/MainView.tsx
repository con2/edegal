import React from 'react';

import AlbumView from './AlbumView';
import Loading from './Loading';
import PictureView from './PictureView';
import { Content, getAlbum } from '../helpers/getAlbum';
import { RouteComponentProps } from 'react-router';

const loadingViewDelayMillis = 500;

const MainView: React.FC<RouteComponentProps<{}>> = ({ location }) => {
  const path = location.pathname;
  const [loading, setLoading] = React.useState(true);
  const [content, setContent] = React.useState<Content | null>(null);

  React.useEffect(() => {
    (async () => {
      // Only show the loading indicator if the request is slow.
      const timeout = setTimeout(() => setLoading(true), loadingViewDelayMillis);

      const content = await getAlbum(path);

      clearTimeout(timeout);
      setContent(content);
      setLoading(false);
    })();
  }, [path]);

  if (loading || !content) {
    return <Loading />;
  } else {
    const { album, picture } = content;

    if (picture) {
      return <PictureView album={album} picture={picture} />;
    } else {
      return <AlbumView album={album} />;
    }
  }
};

export default MainView;
