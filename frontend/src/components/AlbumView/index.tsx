import * as React from 'react';
import { connect } from 'react-redux';

import Album from '../../models/Album';
import TileItem from '../../models/TileItem';
import { State } from '../../modules';
import AppBar from '../AppBar';

import preloadMedia from '../../helpers/preloadMedia';
import AlbumGrid from './AlbumGrid';
import './index.css';
import TextContent from './TextContent';


interface AlbumViewProps {
  album: Album;
}


class AlbumView extends React.PureComponent<AlbumViewProps, {}> {
  render() {
    const { album } = this.props;

    return (
      <div>
        <AppBar />

        {album.body ? <TextContent content={album.body} /> : null}

        {/* Subalbums */}
        <AlbumGrid tiles={album.subalbums} getTitle={(tile: TileItem) => tile.title} />

        {/* Pictures */}
        <AlbumGrid tiles={album.pictures} getTitle={(tile: TileItem) => ""} />
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

export default connect(mapStateToProps)(AlbumView);
