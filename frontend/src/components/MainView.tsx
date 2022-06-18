import React from 'react';

import { RouteComponentProps, StaticContext } from 'react-router';

import AlbumView from './AlbumView';
import Loading from './Loading';
import PictureView from './PictureView';
import { Content, getAlbum } from '../helpers/getAlbum';
import ErrorMessage from './ErrorMessage';
import { T } from '../translations';
import { getDocumentTitle } from '../helpers/breadcrumb';

const loadingViewDelayMillis = 500;

interface LocationState {
  fromAlbumView?: boolean;
}

const MainView: React.FC<RouteComponentProps<{}, StaticContext, LocationState>> = ({ location, history }) => {
  const path = location.pathname;
  const [loading, setLoading] = React.useState(true);
  const [content, setContent] = React.useState<Content | null>(null);
  const [error, setError] = React.useState<unknown>(null);
  const tError = T(r => r.ErrorBoundary);
  const tBreadcrumb = T(r => r.BreadcrumbBar);

  // Attempt at fixing scroll position after navigating back from picture view to album view.
  const fromAlbumView = location.state?.fromAlbumView ?? false;

  React.useEffect(() => {
    let timeout: number | null = null;

    (async () => {
      // Only show the loading indicator if the request is slow.
      timeout = setTimeout(() => setLoading(true), loadingViewDelayMillis);

      let content = null;
      let error = null;
      try {
        content = await getAlbum(path);
      } catch (theError) {
        error = theError;
      }

      clearTimeout(timeout);
      setContent(content);
      setError(error);
      setLoading(false);

      if (content) {
        const { album, picture } = content;
        document.title = getDocumentTitle(tBreadcrumb, album, picture);
      }
    })();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [path]);

  if (error) {
    return <ErrorMessage>{tError(r => r.defaultMessage)}</ErrorMessage>;
  } else if (loading || !content) {
    return <Loading />;
  } else {
    const { album, picture } = content;

    if (album.redirect_url) {
      if (album.redirect_url.indexOf('://') >= 0) {
        document.location.href = album.redirect_url;
      } else {
        setTimeout(() => history.replace(album.redirect_url), 0);
      }

      return <Loading />;
    } else if (picture) {
      return <PictureView album={album} picture={picture} fromAlbumView={fromAlbumView} />;
    } else {
      return <AlbumView album={album} />;
    }
  }
};

export default MainView;
