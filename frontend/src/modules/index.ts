import { RouterState, connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import { History } from 'history';

import Album from '../models/Album';
import Picture from '../models/Picture';
import User from '../models/User';

import album, { AlbumAction } from './album';
import ready, { InitializationAction } from './initialization';
import mainView, { MainViewAction, MainViewState } from './mainView';
import picture, { PictureAction } from './picture';
import user, { UserAction } from './user';


export type Action = AlbumAction
  | InitializationAction
  | MainViewAction
  | PictureAction
  | UserAction;


export interface State {
  album: Album;
  mainView: MainViewState;
  picture: Picture;
  ready: boolean;
  user: User;

  router: RouterState;
}


export default (history: History) => combineReducers({
  router: connectRouter(history),
  album,
  mainView,
  picture,
  ready,
  user,
});
