import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {Link} from 'react-router';

import {GridTile} from 'material-ui/GridList';


export default class PictureTile extends React.Component {
  static propTypes = {
    item: ImmutablePropTypes.map,
  }

  render() {
    const {item} = this.props;
    const title = item.get('title');
    const path = item.get('path');

    return (
      <GridTile
        title={title}
        containerElement={<Link to={path} />}
      />
    );
  }
}
