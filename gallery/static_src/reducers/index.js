import { combineReducers } from 'redux';


const loading = (state, action) => {
  if (typeof state === 'undefined') {
    return true;
  }

  switch (action.type) {
    case 'loading':
      return true;
    case 'loadPicture':
    case 'loadAlbum':
      return false;
  }
};


const albums = (state, action) => {
  if (!state) {
    state = {};
  }

  switch (action.type) {
    case 'loadPicture':
    case 'loadAlbum':
      state = _.clone(state);
      state[action.album.path] = action.album;
      return state;
    default:
      return state;
  }
};


const selectedAlbum = (state, action) => {
  if (!state) {
    state = null;
  }

  switch (action.type) {
    case 'loadPicture':
    case 'loadAlbum':
      return action.album;
    default:
      return state;
  }
};


const selectedPicture = (state, action) => {
  if (!state) {
    state = null;
  }

  switch (action.type) {
    case 'loadPicture':
      return action.picture;
    default:
      return state;
  }
};


const galleryApp = combineReducers({albums, selectedAlbum, selectedPicture, loading});


export default galleryApp;
