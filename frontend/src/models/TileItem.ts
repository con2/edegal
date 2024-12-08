import { Media } from "./Media";

interface TileItem {
  path: string;
  title: string;
  is_public: boolean;
  thumbnail?: Media;
  redirect_url?: string;
}

export default TileItem;
