import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { State } from '.';
import Config from '../Config';
import AlbumCache from '../helpers/AlbumCache';
import Album from '../models/Album';
import { nullMedia } from '../models/Media';
import Picture from '../models/Picture';
import OtherAction from './other';
import {SelectPicture, SelectPictureAction} from './picture';


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


function makeApiUrl(path: string) {
  return `${Config.backend.baseUrl}${Config.backend.apiPrefix}${path}`;
}


function getCached(path: string): Promise<Album> {
  const cached = AlbumCache.get(path);

  if (cached) {
    return Promise.resolve(cached);
  } else {
    return fetch(makeApiUrl(path), {
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

          picture.album = album;
          picture.original = picture.media.find((media) => media.original);
          picture.thumbnail = picture.media.find((media) => media.thumbnail);

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
export const getAlbum: ActionCreator<
  ThunkAction<Promise<AlbumAction>, State, void, AlbumAction>
> = (path: string) => {
  return (dispatch: Dispatch<AlbumAction>) =>
    getCached(path)
      .then((album) => {
        if (album.path === path) {
          // path points to album itself
          return dispatch({
            type: SelectAlbum,
            payload: album,
          });
        } else {
          // path points to a picture in album
          const picture = album.pictures.find(pic => pic.path === path);

          if (!picture) {
            return dispatch({
              type: GetAlbumFailure,
              error: true,
              payload: new Error(
                'the album returned to us did not contain the requested path (this shouldn\'t happen)'
              ),
            });
          }

          return dispatch({
            type: SelectPicture,
            payload: {album, picture},
          });
        }
      }, (err) => dispatch({
        type: GetAlbumFailure,
        error: true,
        payload: err,
      }));
};


const initialState: Album = {
  path: '',
  title: '',
  body: '',
  subalbums: [],
  pictures: [],
  breadcrumb: [],
  thumbnail: nullMedia,
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
