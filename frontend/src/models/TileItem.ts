import { Media } from './Media';

interface TileItem {
  path: string;
  title: string;
  thumbnail?: Media;
  redirect_url?: string;
}

export default TileItem;
