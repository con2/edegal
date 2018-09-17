import supportsWebp from "../helpers/supportsWebp";
import { SelectAlbum, SelectAlbumAction } from './album';
import OtherAction from './other';
import { SelectPicture, SelectPictureAction } from './picture';


export interface AsyncConfig {
  webpSupported: boolean;
}

export type InitializationAction = SelectPictureAction | SelectAlbumAction | OtherAction;


// XXX do this in a more reduxy fashion
let asyncConfigPromise: Promise<AsyncConfig>;
export function getAsyncConfig(): Promise<AsyncConfig> {
  if (!asyncConfigPromise) {
    asyncConfigPromise = (async () => {
      const webpSupported = await supportsWebp();
      return { webpSupported };
    })();
  }

  return asyncConfigPromise;
}


export default function ready(state: boolean = false, action: InitializationAction = OtherAction) {
  switch (action.type) {
    case SelectPicture:
    case SelectAlbum:
      return true;
    default:
      return state;
  }
}
