import Media from './Media';
import TileItem from './TileItem';


interface Picture extends TileItem {
  media: Media[];
};

export default Picture;
