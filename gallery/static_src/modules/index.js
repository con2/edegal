import { combineReducers } from 'redux-immutablejs';

import album from './album';
import picture from './picture';
import mainView from './mainView';


export default combineReducers({
  album,
  mainView,
  picture,
});
