import { combineReducers } from 'redux';

import { Format } from '../models/Media';
import { SelectAlbum, SelectAlbumAction } from './album';
import { InitializationComplete, InitializationCompleteAction } from './initialization';
import OtherAction from './other';
import { SelectPicture, SelectPictureAction } from './picture';


export type MainViewResized = 'edegal/mainView/MainViewResized';
export const MainViewResized: MainViewResized = 'edegal/mainView/MainViewResized';
export interface MainViewResizedAction {
  type: MainViewResized;
  payload: {
    width: number;
    height: number;
  };
}

export function mainViewResized(w: number, h: number): MainViewResizedAction {
  return {
    type: MainViewResized,
    payload: {
      width: w,
      height: h,
    }
  };
}


export type MainViewMode = 'album' | 'picture';
export type MainViewAction = MainViewResizedAction
  | SelectAlbumAction
  | SelectPictureAction
  | InitializationCompleteAction
  | OtherAction;


export interface MainViewState {
  mode: MainViewMode;
  width: number;
  height: number;
  format: Format;
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

function height(state: number = 0, action: MainViewAction = OtherAction) {
  switch (action.type) {
    case MainViewResized:
      return action.payload.height;
    default:
      return state;
  }
}

function format(state: Format = 'jpeg', action: MainViewAction = OtherAction) {
  switch (action.type) {
    case InitializationComplete:
      return action.payload.webpSupported ? 'webp' : 'jpeg';
    default:
      return state;
  }
}


export default combineReducers<MainViewState>({ mode, width, height, format });
