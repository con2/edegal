import Media from '../models/Media';
import Picture from '../models/Picture';


/**
 * Selects which Media to show for a Picture.
 *
 * @param width Picture area width
 * @param height Picture area height
 */
export default function selectMedia(picture: Picture, width: number, height: number): Media {
  const acceptableMedia = picture.media.filter((medium: Media) =>
    !medium.thumbnail && !medium.original
  );

  const fits = (medium: Media) => medium.width <= width && medium.height <= height;
  const doesntFit = (medium: Media) => !fits(medium);
  const tooBigMedia = acceptableMedia.filter(doesntFit);
  let selected: Media | null = null;

  // return smallest that exceeds display area
  tooBigMedia.forEach((medium) => {
    if (!selected || medium.width < selected.width) {
      selected = medium;
    }
  });

  if (selected) {
    return selected;
  }

  // return biggest that fits
  const mediaThatFit = acceptableMedia.filter(fits);
  mediaThatFit.forEach((medium) => {
    if (!selected || medium.width > selected.width) {
      selected = medium;
    }
  });

  if (selected) {
    return selected;
  } else if (acceptableMedia.length > 0) {
    // whatever
    return acceptableMedia[0];
  } else {
    // WHATEVER
    return picture.media[0];
  }
}
