import Media from './Media';
import TileItem from './TileItem';


interface Picture extends TileItem {
  media: Media[];

  next?: Picture;
  previous?: Picture;
};

export default Picture;
