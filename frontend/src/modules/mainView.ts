import { combineReducers } from 'redux';

import { SelectAlbum, SelectAlbumAction } from './album';
import OtherAction from './other';
import { SelectPicture, SelectPictureAction } from './picture';


export type MainViewResized = 'edegal/mainView/MainViewResized';
export const MainViewResized: MainViewResized = 'edegal/mainView/MainViewResized';
export interface MainViewResizedAction {
  type: MainViewResized;
  payload: {
    width: number;
  };
}

export function mainViewResized(w: number): MainViewResizedAction {
  return {
    type: MainViewResized,
    payload: {
      width: w,
    }
  };
}


export type MainViewMode = 'album' | 'picture';
export type MainViewAction = MainViewResizedAction
  | SelectAlbumAction
  | SelectPictureAction
  | OtherAction;


export interface MainViewState {
  mode: MainViewMode;
  width: number;
}


function mode(state: MainViewMode = 'album', action: MainViewAction = OtherAction) {
  switch (action.type) {
    case SelectAlbum:
      return 'album';
    case SelectPicture:
      return 'picture';
    default:
      return state;
  }
}


function width(state: number = 0, action: MainViewAction = OtherAction) {
  switch (action.type) {
    case MainViewResized:
      return action.payload.width;
    default:
      return state;
  }
}


export default combineReducers<MainViewState>({ mode, width });
