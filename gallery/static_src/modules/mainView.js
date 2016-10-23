import {createReducer} from 'redux-immutablejs';


import {SELECT_ALBUM} from './album';
import {SELECT_PICTURE} from './picture';


const initialState = null;


export default createReducer(initialState, {
  [SELECT_ALBUM]: () => 'album',
  [SELECT_PICTURE]: () => 'picture',
}, false);
