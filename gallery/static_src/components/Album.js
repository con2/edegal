import React, {PropTypes} from 'react';

import GridList from 'material-ui/GridList';

import AlbumTile from './AlbumTile';
import PictureTile from './PictureTile';
import {PictureShape, SubAlbumShape} from '../shapes';


const Album = ({pictures, subalbums, onTileClick}) => (
  <GridList cellHeight={200}>
    {subalbums.map(subalbum => (
      <AlbumTile key={subalbum.path} path={subalbum.path} />
    ))}
    {pictures.map(picture => (
      <PictureTile key={picture.path} path={picture.path} />
    ))}
  </GridList>
);

Album.propTypes = {
  pictures: PropTypes.arrayOf(PictureShape),
  subalbums: PropTypes.arrayOf(SubAlbumShape),
  onTileClick: PropTypes.func,
};

export default Album;
