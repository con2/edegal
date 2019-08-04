import * as React from 'react';

import AlbumView from './AlbumView';
import Loading from './Loading';
import PictureView from './PictureView';
import { Content, getAlbum } from '../helpers/getAlbum';
import { RouteComponentProps } from 'react-router';


const MainView: React.FC<RouteComponentProps<{}>> = ({ location }) => {
  const path = location.pathname;
  const [content, setContent] = React.useState<Content | null>(null);

  React.useEffect(() => {
    getAlbum(path).then(setContent);
  }, [path])

  if (content) {
    const { album, picture } = content;

    if (picture) {
      return <PictureView album={album} picture={picture}/>
    } else {
      return <AlbumView album={album} />
    }
  } else {
    return <Loading />;
  }
}


export default MainView;
