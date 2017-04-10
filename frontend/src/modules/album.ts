import Album from '../models/Album';
import AlbumCache from '../helpers/AlbumCache';
import Config from '../Config';
import { nullMedia } from '../models/Media';
import OtherAction from './other';
import Picture from '../models/Picture';
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


function makeApiUrl(path: string) {
  return `${Config.backend.baseUrl}${Config.backend.apiPrefix}${path}`;
}


function getCached(path: string): Promise<Album> {
  const cached = AlbumCache.get(path);

  if (cached) {
    return Promise.resolve(cached);
  } else {
    const options = {
      headers: {
        accept: 'application/json',
      },
      credentials: 'same-origin',
    };

    return fetch(makeApiUrl(path), options)
      .then((response) => response.json())
      .then((data: any) => {
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
export function getAlbum(path: string) {
  return (dispatch: Function) =>
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
      })
      .catch(err => dispatch({
        type: GetAlbumFailure,
        error: true,
        payload: err,
      }));
}


const initialState: Album = {
  path: '',
  title: '',
  subalbums: [],
  pictures: [],
  breadcrumb: [],
  thumbnail: nullMedia,
};

type AlbumAction = SelectAlbumAction | GetAlbumFailureAction | SelectPictureAction | OtherAction;


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
