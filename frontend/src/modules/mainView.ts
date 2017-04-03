import { SelectAlbum, SelectAlbumAction } from './album';
import { SelectPicture, SelectPictureAction } from './picture';
import OtherAction from './other';


export type MainView = 'loading' | 'album' | 'picture';
type MainViewAction = SelectAlbumAction | SelectPictureAction | OtherAction;


export default function mainView(state: MainView = 'loading', action: MainViewAction = OtherAction) {
  switch (action.type) {
    case SelectAlbum:
      return 'album';
    case SelectPicture:
      return 'picture';
    default:
      return state;
  }
}
