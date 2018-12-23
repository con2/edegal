import Breadcrumb from './Breadcrumb';
import Picture from './Picture';
import Subalbum from './Subalbum';
import TermsAndConditions from './TermsAndConditions';


interface Album {
  path: string;
  title: string;
  body: string;
  subalbums: Subalbum[];
  pictures: Picture[];
  breadcrumb: Breadcrumb[];
  redirect_url: string;
  terms_and_conditions?: TermsAndConditions;
}


export default Album;
