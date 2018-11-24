import Album from './Album';
import { Media } from './Media';
import TileItem from './TileItem';


interface Picture extends TileItem {
  next?: Picture;
  previous?: Picture;
  album?: Album;

  original: Media;
  preview: Media;
  thumbnail: Media;
}

export default Picture;
