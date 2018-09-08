import { RouterState } from 'connected-react-router';
import { combineReducers } from 'redux';

import Album from '../models/Album';
import Picture from '../models/Picture';
import User from '../models/User';
import album from './album';
import downloadDialog, { DownloadDialogState } from './downloadDialog';
import mainView, { MainViewState } from './mainView';
import picture from './picture';
import user from './user';


export interface State {
  album: Album;
  downloadDialog: DownloadDialogState;
  mainView: MainViewState;
  picture: Picture;
  user: User;
  router: RouterState;
}


export default combineReducers({
  album,
  downloadDialog,
  mainView,
  picture,
  user,
});
