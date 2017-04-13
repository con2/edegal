import Breadcrumb from './Breadcrumb';
import Media from './Media';
import Picture from './Picture';
import Subalbum from './Subalbum';
import TermsAndConditions from './TermsAndConditions';


interface Album {
  path: string;
  title: string;
  subalbums: Subalbum[];
  pictures: Picture[];
  thumbnail: Media;
  breadcrumb: Breadcrumb[];
  terms_and_conditions?: TermsAndConditions;
};


export default Album;
