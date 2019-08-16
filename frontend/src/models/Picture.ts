import { Media } from './Media';
import TileItem from './TileItem';

interface Picture extends TileItem {
  next?: Picture;
  previous?: Picture;

  original: Media;
  preview: Media;
  thumbnail: Media;
}

export default Picture;
