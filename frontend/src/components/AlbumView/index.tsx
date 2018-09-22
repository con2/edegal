import * as React from 'react';
import { connect } from 'react-redux';

import Album from '../../models/Album';
import TileItem from '../../models/TileItem';
import { State } from '../../modules';
import AppBar from '../AppBar';

import preloadMedia from '../../helpers/preloadMedia';
import AlbumGrid from './AlbumGrid';
import './index.css';


interface AlbumViewProps {
  album: Album;
}


class AlbumView extends React.PureComponent<AlbumViewProps, {}> {
  render() {
    return (
      <div>
        <AppBar />

        {/* Subalbums */}
        <AlbumGrid tiles={this.props.album.subalbums} getTitle={(tile: TileItem) => tile.title} />

        {/* Pictures */}
        <AlbumGrid tiles={this.props.album.pictures} getTitle={(tile: TileItem) => ""} />
      </div>
    );
  }

  preloadFirstPicture() {
    const firstPicture = this.props.album.pictures[0];

    if (firstPicture) {
      preloadMedia(firstPicture);
    }
  }

  componentDidMount() {
    this.preloadFirstPicture();
  }

  componentDidUpdate() {
    this.preloadFirstPicture();
  }
}


const mapStateToProps = (state: State) => ({
  album: state.album,
});

export default connect<AlbumViewProps>(mapStateToProps)(AlbumView);
