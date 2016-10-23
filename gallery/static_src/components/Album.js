import GridList from 'material-ui/GridList';
import ImmutablePropTypes from 'react-immutable-proptypes';
import React, {PropTypes} from 'react';

import PictureTile from './PictureTile';


export default class Album extends React.Component {
  static propTypes = {
    album: ImmutablePropTypes.map,
  }

  render() {
    const {album} = this.props;

    return (
      <GridList cellHeight={200}>
        {album.get('subalbums').map(subalbum => (
          <PictureTile key={subalbum.get('path')} item={subalbum} />
        ))}
        {album.get('pictures').map(picture => (
          <PictureTile key={picture.get('path')} item={picture} />
        ))}
      </GridList>
    );
  }
}
