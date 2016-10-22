import React, {PropTypes} from 'react';

import {GridTile} from 'material-ui/GridList';


const AlbumTile = ({path}) => (
  <GridTile title={path} />
);


AlbumTile.propTypes = {
  path: PropTypes.string.isRequired,
};


export default AlbumTile;
