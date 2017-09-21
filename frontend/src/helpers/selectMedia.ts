import Media from '../models/Media';
import Picture from '../models/Picture';


const WRAP_VERTICAL_UNUSABLE_PX = 50;


type Dimensions = [number, number];


export function getPictureAreaDimensions(): Dimensions {
  return [window.innerWidth, window.innerHeight - WRAP_VERTICAL_UNUSABLE_PX];
}


// TODO Suboptimal for quality: should select the first too big media instead of the first too small
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

  const mediaThatFit = picture.media.filter((medium: Media) =>
    medium.width <= maxWidth && medium.height <= maxHeight
  );

  if (mediaThatFit.length === 0) {
    // fall back to whatever media
    return picture.media[0];
  }

  // return biggestThatFits that fits
  let biggestThatFits: Media | null = null;
  mediaThatFit.forEach((medium) => {
    if (!biggestThatFits || medium.width > biggestThatFits.width) {
      biggestThatFits = medium;
    }
  });

  // we know mediaThatFit is not empty by know, so there also must be a biggestThatFits
  return biggestThatFits!;
}
