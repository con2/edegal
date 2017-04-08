import Album from './Album';
import Media from './Media';
import TileItem from './TileItem';


interface Picture extends TileItem {
  media: Media[];

  original?: Media;
  next?: Picture;
  previous?: Picture;
  album?: Album;
};

export default Picture;
