import GridList from 'material-ui/GridList';
import Paper from 'material-ui/Paper';
import * as React from 'react';
import { connect } from 'react-redux';

import Album from '../models/Album';
import AppBar from './AppBar';
import PictureTile from './PictureTile';
import { State } from '../modules';
import preloadMedia from '../helpers/preloadMedia';


const cellHeight = 240;
const referenceWidth = 360;
const bodyStyle = {
  padding: '1em',
  margin: '1em',
};


interface AlbumViewOwnProps {}
interface AlbumViewStateProps {
  album: Album;
}
interface AlbumViewDispatchProps {}
type AlbumViewProps = AlbumViewOwnProps & AlbumViewStateProps & AlbumViewDispatchProps;
interface AlbumViewState {
  columns: number;
}


class AlbumView extends React.Component<AlbumViewProps, AlbumViewState> {
  state = {
    columns: 1,
  };

  render() {
    const {album} = this.props;
    const {columns} = this.state;

    return (
      <div>
        <AppBar />

        {album.body ? (
          <Paper style={bodyStyle}>
            <div dangerouslySetInnerHTML={{__html: album.body}} />
          </Paper>
        ) : null}

        <GridList cellHeight={cellHeight} cols={columns}>
          {album.subalbums.map(subalbum => (
            <PictureTile key={subalbum.path} item={subalbum} />
          ))}
          {album.pictures.map(picture => (
            <PictureTile key={picture.path} item={picture} />
          ))}
        </GridList>
      </div>
    );
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateColumns);
    this.updateColumns();
    this.preloadFirstPicture();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateColumns);
  }

  updateColumns = () => {
    const columns = Math.ceil(window.innerWidth / referenceWidth);
    this.setState({ columns });
  }

  preloadFirstPicture() {
    const firstPicture = this.props.album.pictures[0];
    if (firstPicture) {
      preloadMedia(firstPicture);
    }
  }
}


const mapStateToProps = (state: State) => ({
  album: state.album,
});

const mapDispatchToProps = {};


export default connect<AlbumViewStateProps, AlbumViewDispatchProps, AlbumViewOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(AlbumView);
