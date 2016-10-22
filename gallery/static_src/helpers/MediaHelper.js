import _ from 'lodash';
import getContent from '../services/AlbumService';

const WRAP_VERTICAL_UNUSABLE_PX = 50,
  THUMBNAIL_HEIGHT = 240;


export function getPictureAreaDimensions() {
  return [window.innerWidth, window.innerHeight - WRAP_VERTICAL_UNUSABLE_PX];
}


function byWidth(medium) {
  return medium.width;
}


export function selectMedia(picture) {
  const [maxHeight, maxWidth] = getPictureAreaDimensions();
  const mediaThatFit = _.filter(picture.media, medium =>
    medium.width <= maxWidth && medium.height <= maxHeight
  );

  if (!_.isEmpty(mediaThatFit)) {
    return _.max(mediaThatFit, byWidth);
  } else {
    return _.min(picture.media, byWidth);
  }
}


export function getOriginal(picture) {
  return _.find(picture.media, medium => medium.original);
}


export function selectPictureThumbnail(picture) {
  return _.min(picture.media, medium => Math.abs(medium.height - THUMBNAIL_HEIGHT));
}


export function setPictureThumbnail(picture) {
  return picture.thumbnail = selectPictureThumbnail(picture);
}
