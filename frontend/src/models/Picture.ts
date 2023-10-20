import { Media } from './Media';
import TileItem from './TileItem';
import Credits from './Credits';

interface Picture extends TileItem {
  // not present in server picture, set in client
  index: number;

  original: Media;
  preview: Media;
  thumbnail: Media;

  taken_at?: string;

  // Only present if different than album
  credits?: Credits;
}

export default Picture;
