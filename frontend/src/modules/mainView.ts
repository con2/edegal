import { combineReducers } from 'redux';

import { SelectAlbum, SelectAlbumAction } from './album';
import OtherAction from './other';
import { SelectPicture, SelectPictureAction } from './picture';


export type MainViewResized = 'edegal/mainView/MainViewResized';
export const MainViewResized: MainViewResized = 'edegal/mainView/MainViewResized';
export interface MainViewResizedAction {
  type: MainViewResized;
  width: number;
  height: number;
}

export const mainViewResized = (w: number, h: number) => ({
  type: MainViewResized,
  width: w,
  height: h,
});


export type MainViewMode = 'loading' | 'album' | 'picture';
type MainViewAction = MainViewResizedAction | SelectAlbumAction | SelectPictureAction | OtherAction;


export interface MainViewState {
  mode: MainViewMode;
  width: number;
  height: number;
}


function mode(state: MainViewMode = 'loading', action: MainViewAction = OtherAction) {
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
      return action.width;
    default:
      return state;
  }
}

function height(state: number = 0, action: MainViewAction = OtherAction) {
  switch (action.type) {
    case MainViewResized:
      return action.height;
    default:
      return state;
  }
}


export default combineReducers<MainViewState>({ mode, width, height });
