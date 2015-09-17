import _ from 'lodash';
import {setPictureThumbnail} from '../helpers/MediaHelper';


var cache = {};


export function getContent(path) {
  var album, picture;

  if (cache[path]) {
    album = cache[path];
    picture = _.find(album.pictures, {
      path: path
    });
    return Promise.resolve({
      album: album,
      picture: picture
    });
  }

  return fetch('/api/v2' + path).then(function(response) {
    return response.json();
  }).then(album => {
    cache[path] = album;

    var previous = null;
    for (let picture of album.pictures) {
      cache[picture.path] = album;

      mediaHelper.setPictureThumbnail(picture);

      if (previous) {
        previous.next = picture.path;
        picture.previous = previous.path;
      }
      previous = picture;
    }

    // found if path points to picture, undefined if album
    picture = _.find(album.pictures, {path: path});

    return {
      album: album,
      picture: picture
    };
  });
}
