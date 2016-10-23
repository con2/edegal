import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {Link} from 'react-router';

import {GridTile} from 'material-ui/GridList';


export default class PictureTile extends React.Component {
  static propTypes = {
    item: ImmutablePropTypes.map,
  }

  render() {
    const
      {item} = this.props,
      title = item.get('title'),
      path = item.get('path'),
      src = item.getIn(['thumbnail', 'src']);

    return (
      <GridTile
        title={title}
        containerElement={<Link to={path} />}
      >
        <img src={src} alt={title} />
      </GridTile>
    );
  }
}
