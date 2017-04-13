import Album from '../models/Album';
import Picture from '../models/Picture';
import { nullMedia } from '../models/Media';
import OtherAction from './other';


export type SelectPicture = 'edegal/picture/SelectPicture';
export const SelectPicture: SelectPicture = 'edegal/picture/SelectPicture';

export interface SelectPictureAction {
  type: SelectPicture;
  payload: {
    album: Album;
    picture: Picture;
  };
}


const initialState: Picture = {
  path: '',
  title: '',
  thumbnail: nullMedia,
  media: []
};


type PictureAction = SelectPictureAction | OtherAction;


export default function picture(state: Picture = initialState, action: PictureAction = OtherAction): Picture {
  switch (action.type) {
    case SelectPicture:
      return action.payload.picture;
    default:
      return state;
  }
}
