import { combineReducers } from 'redux-immutablejs';

import album from './album';
import picture from './picture';


export default combineReducers({
  album,
  picture,
});
