import getContent from '../services/AlbumService';


export const navigate = (path) => (dispatch) => {
  dispatch(loading(path));

  return getContent(path).then(({album, picture}) => {
    if (picture) {
      dispatch(loadPicture(album, picture));
    } else {
      dispatch(loadAlbum(album));
    }
  });
};


export const loading = (path) => ({
  type: 'loading',
  path,
});


export const loadAlbum = (album) => ({
  type: 'loadAlbum',
  album,
});


export const loadPicture = (album, picture) => ({
  type: 'loadPicture',
  album,
  picture,
});
