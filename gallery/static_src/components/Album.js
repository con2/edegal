import {asyncConnect} from 'redux-connect';
import {connect} from 'react-redux';
import GridList from 'material-ui/GridList';
import ImmutablePropTypes from 'react-immutable-proptypes';
import React, {PropTypes} from 'react';

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
          <PictureTile key={subalbum.get('path')} item={subalbum} />
        ))}
        {pictures.map(picture => (
          <PictureTile key={picture.get('path')} item={picture} />
        ))}
      </GridList>
    );
  }
}
