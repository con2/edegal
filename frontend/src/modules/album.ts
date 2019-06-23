import { push, RouterAction } from 'connected-react-router';
import { Dispatch } from 'redux';

import Config from '../Config';
import AlbumCache from '../helpers/AlbumCache';
import Album from '../models/Album';
import { Format } from '../models/Media';
import Picture from '../models/Picture';
import { getAsyncConfig } from './initialization';
import OtherAction from './other';
import { SelectPicture, SelectPictureAction } from './picture';


export type SelectAlbum = 'edegal/album/SelectAlbum';
export const SelectAlbum: SelectAlbum = 'edegal/album/SelectAlbum';
export interface SelectAlbumAction {
  type: SelectAlbum;
  payload: Album;
}

export type GetAlbumFailure = 'edegal/album/GetAlbumFailure';
export const GetAlbumFailure: GetAlbumFailure = 'edegal/album/GetAlbumFailure';
export interface GetAlbumFailureAction {
  type: GetAlbumFailure;
  error: true;
  payload: Error;
}


export type AlbumAction = SelectAlbumAction | GetAlbumFailureAction | SelectPictureAction | OtherAction;


function getCached(path: string, format: Format): Promise<Album> {
  const cached = AlbumCache.get(path);
  const url = `${Config.backend.baseUrl}${Config.backend.apiPrefix}${path}?format=${format}`;

  if (cached) {
    return Promise.resolve(cached);
  } else {
    return fetch(url, {
      headers: {
        accept: 'application/json',
      },
      credentials: 'same-origin',
    })
      .then((response: Response) => response.json())
      .then((data: any) => { // tslint:disable-line:no-any
        // TODO: validate response
        const album: Album = data;

        AlbumCache.set(path, album);
        let previous: Picture;
        album.pictures.forEach((picture) => {
          if (previous) {
            previous.next = picture;
            picture.previous = previous;
          }

          AlbumCache.set(picture.path, album);
          previous = picture;
        });
        return album;
      });
  }
}


/**
 * A thunk action creator that fetches an Album from the backend API. As any path may refer to an Album
 * or a Picture, we determine which we got after receiving results and dispatch SelectAlbum or SelectPicture
 * respectively.
 *
 * @param path Path to an Album or Picture.
 */
export const getAlbum = (path: string) => {
  return async (dispatch: Dispatch<AlbumAction | RouterAction>) => {
    try {
      // TODO ugly, do the webp support thing in a more reduxy fashion
      const asyncConfig = await getAsyncConfig();
      const format = asyncConfig.webpSupported ? 'webp' : 'jpeg';

      // Remove trailing slash
      if (path !== '/' && path.slice(-1) === '/') {
        path = path.slice(0, -1);
      }

      const album = await getCached(path, format);

      if (album.path === path) {
        // path points to album itself
        if (album.redirect_url) {
          return dispatch(push(album.redirect_url));
        } else {
          return dispatch({
            type: SelectAlbum,
            payload: album,
          });
        }
      } else {
        // path points to a picture in album
        const picture = album.pictures.find(pic => pic.path === path);

        if (!picture) {
          const message = 'the album returned to us did not contain the requested path (this shouldn\'t happen)';
          console.error('Failed to fetch album:', message, { album, path });

          return dispatch({
            type: GetAlbumFailure,
            error: true,
            payload: new Error(message),
          });
        }

        return dispatch({
          type: SelectPicture,
          payload: { album, picture },
        });
      }
    } catch (err) {
      console.error('Failed to fetch album:', err);
      return dispatch({
        type: GetAlbumFailure,
        error: true,
        payload: err,
      });
    }
  };
};


const initialState: Album = {
  path: '',
  title: '',
  body: '',
  redirect_url: '',
  date: '',
  subalbums: [],
  pictures: [],
  breadcrumb: [],
  layout: 'simple',
  credits: {},
};


export default function(state: Album = initialState, action: AlbumAction) {
  switch (action.type) {
    case SelectAlbum:
      return action.payload;
    case SelectPicture:
      return action.payload.album;
    default:
      return state;
  }
}
