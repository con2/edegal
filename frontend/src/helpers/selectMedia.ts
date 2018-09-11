import Media from '../models/Media';
import Picture from '../models/Picture';


const WRAP_VERTICAL_UNUSABLE_PX = 50;


type Dimensions = [number, number];


export function getPictureAreaDimensions(): Dimensions {
  return [window.innerWidth, window.innerHeight - WRAP_VERTICAL_UNUSABLE_PX];
}


/**
 * Selects which Media to show for a Picture.
 */
export default function selectMedia(picture: Picture, dimensions?: Dimensions): Media {
  let maxHeight: number, maxWidth: number;
  if (dimensions) {
    [maxHeight, maxWidth] = dimensions;
  } else {
    [maxHeight, maxWidth] = getPictureAreaDimensions();
  }

  const acceptableMedia = picture.media.filter((medium: Media) =>
    !medium.thumbnail && !medium.original
  );

  const fits = (medium: Media) => medium.width <= maxWidth && medium.height <= maxHeight;
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
