import Immutable from 'immutable';
import {createReducer} from 'redux-immutablejs';

import {get} from '../helpers/http';


const
  GET_ALBUM_REQUEST = 'tallessa/stuff/GET_ALBUM_REQUEST',
  GET_ALBUM_SUCCESS = 'tallessa/stuff/GET_ALBUM_SUCCESS',
  GET_ALBUM_FAILURE = 'tallessa/stuff/GET_ALBUM_FAILURE';

const initialState = Immutable.fromJS([]);


export default createReducer(initialState, {
  [GET_ALBUM_SUCCESS]: (state, action) => Immutable.fromJS(action.payload),
});


export function getStuff() {
  return {
    types: [GET_ALBUM_REQUEST, GET_ALBUM_SUCCESS, GET_ALBUM_FAILURE],
    payload: get('/stuff'),
  };
}
