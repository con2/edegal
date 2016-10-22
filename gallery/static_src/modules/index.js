import { combineReducers } from 'redux-immutablejs';

import album from './album';
import picture from './picture';
import ui from './ui';


export default combineReducers({
  album,
  picture,
  ui,
});
