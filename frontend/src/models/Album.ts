import Breadcrumb from './Breadcrumb';
import Subalbum from './Subalbum';
import Picture from './Picture';
import Media from './Media';


interface Album {
  path: string;
  title: string;
  subalbums: Subalbum[];
  pictures: Picture[];
  thumbnail: Media;
  breadcrumb: Breadcrumb[];
};


export default Album;
