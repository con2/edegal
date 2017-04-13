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
        {item.thumbnail && <img src={item.thumbnail.src} alt={item.title} />}
      </GridTile>
    );
  }
}
