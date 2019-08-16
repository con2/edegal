import Picture from '../models/Picture';

/**
 * Preloads the picture preview for the given image for SPEED.
 *
 * @param picture The picture to preload the preview media for.
 */
export default function preloadMedia(picture: Picture) {
  const element = document.createElement('img');
  element.src = picture.preview.src;
}
