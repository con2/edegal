const WRAP_VERTICAL_UNUSABLE_PX = 64;


export function getPictureAreaDimensions() {
  return [window.innerWidth, window.innerHeight - WRAP_VERTICAL_UNUSABLE_PX];
}


function byWidth(medium) {
  return medium.get('width');
}


export function selectMedia(picture) {
  const [maxWidth, maxHeight] = getPictureAreaDimensions();
  const mediaThatFit = picture.get('media').filter(medium =>
    medium.get('width') <= maxWidth && medium.get('height') <= maxHeight
  );

  if (!mediaThatFit.isEmpty()) {
    return mediaThatFit.maxBy(byWidth);
  } else {
    return picture.get('media').minBy(byWidth);
  }
}
