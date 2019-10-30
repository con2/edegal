import { Media } from './Media';
import TileItem from './TileItem';
import Credits from './Credits';

interface Picture extends TileItem {
  next?: Picture;
  previous?: Picture;

  original: Media;
  preview: Media;
  thumbnail: Media;

  // Only present if different than album
  credits?: Credits;
}

export default Picture;
