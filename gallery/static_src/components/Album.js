import React, {PropTypes} from 'react';
import {asyncConnect} from 'redux-connect';
import {connect} from 'react-redux';
import GridList from 'material-ui/GridList';

import AlbumTile from './AlbumTile';
import PictureTile from './PictureTile';
import {PictureShape, SubAlbumShape} from '../shapes';
import {getAlbum} from '../modules/album';


@asyncConnect([{
  promise: ({store}) => store.dispatch(getAlbum('/')), // FIXME hard-coded path
}])
@connect(
  state => ({
    album: state.tallessa.get('album'),
  }),
  {}
)
export default class Album extends React.Component {
  static propTypes = {
    pictures: PropTypes.arrayOf(PictureShape),
    subalbums: PropTypes.arrayOf(SubAlbumShape),
    onTileClick: PropTypes.func,
  }

  render() {
    const {pictures, subalbums} = this.props;

    return (
      <GridList cellHeight={200}>
        {subalbums.map(subalbum => (
          <AlbumTile key={subalbum.path} path={subalbum.path} />
        ))}
        {pictures.map(picture => (
          <PictureTile key={picture.path} path={picture.path} />
        ))}
      </GridList>
    );
  }
}
