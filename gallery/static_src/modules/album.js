import Immutable from 'immutable';
import {createReducer} from 'redux-immutablejs';
import _ from 'lodash';

import {get} from '../helpers/http';

import {SELECT_PICTURE} from './picture';


export const
  SELECT_ALBUM = 'edegal/album/SELECT_ALBUM',
  GET_ALBUM_FAILURE = 'edegal/album/GET_ALBUM_FAILURE';

const initialState = Immutable.fromJS({});


export default createReducer(initialState, {
  [SELECT_ALBUM]: (state, action) => Immutable.fromJS(action.payload),
  [SELECT_PICTURE]: (state, action) => Immutable.fromJS(action.payload.album),
});


export function getAlbum(path) {
  return dispatch =>
    get(path)
      .then((album) => {
        if (album.path === path) {
          // path points to album itself
          return dispatch({
            type: SELECT_ALBUM,
            payload: album,
          });
        } else {
          // path points to a picture in album
          const picture = _.find(album.pictures, {path});

          return dispatch({
            type: SELECT_PICTURE,
            payload: {album, picture},
          });
        }
      })
      .catch(err => dispatch({
        type: GET_ALBUM_FAILURE,
        error: true,
        payload: err,
      }));
}
