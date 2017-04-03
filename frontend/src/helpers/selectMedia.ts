import Media from '../models/Media';
import Picture from '../models/Picture';


// TODO stub
export default function selectMedia(picture: Picture): Media {
  return picture.media[0];
}
