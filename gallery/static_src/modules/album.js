import Immutable from 'immutable';
import {createReducer} from 'redux-immutablejs';

import {get} from '../helpers/http';


const
  GET_ALBUM_REQUEST = 'edegal/stuff/GET_ALBUM_REQUEST',
  GET_ALBUM_SUCCESS = 'edegal/stuff/GET_ALBUM_SUCCESS',
  GET_ALBUM_FAILURE = 'edegal/stuff/GET_ALBUM_FAILURE';

const initialState = Immutable.fromJS({});


export default createReducer(initialState, {
  [GET_ALBUM_SUCCESS]: (state, action) => {
    console.log('GET_ALBUM_SUCCESS', action)
    return Immutable.fromJS(action.payload);
  }
});


export function getAlbum(path) {
  console.log('getAlbum', path);
  return {
    types: [GET_ALBUM_REQUEST, GET_ALBUM_SUCCESS, GET_ALBUM_FAILURE],
    payload: get(path),
  };
}
