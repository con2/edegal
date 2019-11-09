import React, { Suspense } from 'react';
import useSWR from 'swr';

import AlbumView from './AlbumView';
import Loading from './Loading';
import PictureView from './PictureView';
import { Content, getAlbum } from '../helpers/getAlbum';
import { RouteComponentProps } from 'react-router';
import ErrorBoundary from './ErrorBoundary';

const MainView: React.FC<RouteComponentProps<{}>> = ({ location, history }) => {
  const path = location.pathname;

  const { data } = useSWR<Content>(path, getAlbum, { suspense: true });
  const { album, picture } = data!;

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
};

const MainViewSuspense: React.FC<RouteComponentProps<{}>> = props => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <MainView {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default MainViewSuspense;
