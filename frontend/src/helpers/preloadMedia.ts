import Picture from '../models/Picture';
import selectMedia from './selectMedia';


/**
 * Preloads the media for the given image for SPEED. The media to use is selected using
 * the `selectMedia` helper.
 *
 * @param picture The picture to preload media for.
 */
export default function preloadMedia(picture: Picture) {
  console.log('preloadMedia', picture.path);
  const media = selectMedia(picture);
  const element = document.createElement('img');
  element.src = media.src;
}
