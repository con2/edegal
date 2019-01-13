import Breadcrumb from './Breadcrumb';
import Picture from './Picture';
import Subalbum from './Subalbum';
import TermsAndConditions from './TermsAndConditions';


export type Layout = 'yearly' | 'simple';


interface Album {
  path: string;
  title: string;
  body: string;
  subalbums: Subalbum[];
  pictures: Picture[];
  breadcrumb: Breadcrumb[];
  redirect_url: string;
  date: string;
  layout: Layout;
  terms_and_conditions?: TermsAndConditions;
}


export default Album;
