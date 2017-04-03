import GridList from 'material-ui/GridList';
import * as React from 'react';

import Album from '../models/Album';
import PictureTile from './PictureTile';


const cellHeight = 240;
const referenceWidth = 400;


interface AlbumViewProps {
  album: Album;
}
interface AlbumViewState {
  columns: number;
}


export default class AlbumView extends React.Component<AlbumViewProps, AlbumViewState> {
  state = {
    columns: 1,
  };

  render() {
    const {album} = this.props;
    const {columns} = this.state;

    return (
      <GridList cellHeight={cellHeight} cols={columns}>
        {album.subalbums.map(subalbum => (
          <PictureTile key={subalbum.path} item={subalbum} />
        ))}
        {album.pictures.map(picture => (
          <PictureTile key={picture.path} item={picture} />
        ))}
      </GridList>
    );
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateColumns);
    this.updateColumns();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateColumns);
  }

  updateColumns = () => {
    const columns = Math.ceil(window.innerWidth / referenceWidth);
    this.setState({ columns });
  }
}
