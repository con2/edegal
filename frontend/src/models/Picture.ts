import Album from './Album';
import Media from './Media';
import TileItem from './TileItem';
import TermsAndConditions from './TermsAndConditions';


interface Picture extends TileItem {
  media: Media[];

  original?: Media;
  next?: Picture;
  previous?: Picture;
  album?: Album;
  terms_and_conditions?: TermsAndConditions;
};

export default Picture;
