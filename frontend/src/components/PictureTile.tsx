import * as React from 'react';
import {Link} from 'react-router';

import {GridTile} from 'material-ui/GridList';

import TileItem from '../models/TileItem';


interface PictureTileProps {
  item: TileItem;
}
interface PictureTileState {}


export default class PictureTile extends React.Component<PictureTileProps, PictureTileState> {
  render() {
    const {item} = this.props;

    return (
      <GridTile title={item.title} containerElement={<Link to={item.path} />}>
        <div style={{ backgroundImage: `url(${item.thumbnail.src})` }} />
      </GridTile>
    );
  }
}
