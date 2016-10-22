import {asyncConnect} from 'redux-connect';
import {connect} from 'react-redux';
import GridList from 'material-ui/GridList';
import ImmutablePropTypes from 'react-immutable-proptypes';
import React, {PropTypes} from 'react';

import AlbumTile from './AlbumTile';
import PictureTile from './PictureTile';
import {getAlbum} from '../modules/album';


@asyncConnect([{
  promise: ({params: {splat}, store}) => store.dispatch(getAlbum(`/${splat || ''}`)),
}])
@connect(
  state => ({
    pictures: state.edegal.getIn(['album', 'pictures']),
    subalbums: state.edegal.getIn(['album', 'subalbums']),
  }),
  {}
)
export default class Album extends React.Component {
  static propTypes = {
    pictures: ImmutablePropTypes.list,
    subalbums: ImmutablePropTypes.list,
    onTileClick: PropTypes.func,
  }

  render() {
    const {pictures, subalbums} = this.props;

    return (
      <GridList cellHeight={200}>
        {subalbums.map(subalbum => (
          <AlbumTile key={subalbum.get('path')} path={subalbum.get('path')} />
        ))}
        {pictures.map(picture => (
          <PictureTile key={picture.get('path')} path={picture.get('path')} />
        ))}
      </GridList>
    );
  }
}
