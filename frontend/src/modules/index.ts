import { RouterState } from 'connected-react-router';
import { combineReducers } from 'redux';

import Album from '../models/Album';
import Picture from '../models/Picture';
import User from '../models/User';

import album, { AlbumAction } from './album';
import downloadDialog, { DownloadDialogAction, DownloadDialogState } from './downloadDialog';
import ready, { InitializationAction } from './initialization';
import mainView, { MainViewAction, MainViewState } from './mainView';
import picture, { PictureAction } from './picture';
import user, { UserAction } from './user';


export type Action = AlbumAction
  | DownloadDialogAction
  | InitializationAction
  | MainViewAction
  | PictureAction
  | UserAction;


export interface State {
  album: Album;
  downloadDialog: DownloadDialogState;
  mainView: MainViewState;
  picture: Picture;
  ready: boolean;
  user: User;

  router: RouterState;
}


export default combineReducers({
  album,
  downloadDialog,
  mainView,
  picture,
  ready,
  user,
});
