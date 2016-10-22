import {combineReducers, createReducer} from 'redux-immutablejs';


const
  SIGN_OUT = 'edegal/ui/SIGN_OUT',
  TOGGLE_DRAWER = 'edegal/ui/TOGGLE_DRAWER';


const drawer = createReducer(true, {
  [TOGGLE_DRAWER]: state => !state,
}, false);


export default combineReducers({
  drawer,
});


export function toggleDrawer() {
  return {
    type: TOGGLE_DRAWER,
  };
}


export function signOut() {
  return {
    type: SIGN_OUT,
  };
}
