import { Media } from "./Media";
import TileItem from "./TileItem";
import Credits from "./Credits";

interface Picture extends TileItem {
  next?: string;
  previous?: string;

  original: Media;
  preview: Media;
  thumbnail: Media;

  taken_at?: string;

  // Only present if different than album
  credits?: Credits;
}

export default Picture;
