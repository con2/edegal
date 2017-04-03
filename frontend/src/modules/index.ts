import { RouterState, routerReducer } from 'react-router-redux';

import Album from '../models/Album';
import Picture from '../models/Picture';
import User from '../models/User';
import album from './album';
import picture from './picture';
import user from './user';
import mainView, { MainView } from './mainView';


export interface State {
  album: Album;
  mainView: MainView;
  picture: Picture;
  user: User;

  routing: RouterState;
}


export default {
  album,
  mainView,
  picture,
  user,
  routing: routerReducer
};
