import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import editorIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-editor-symbol.svg';
import navigationIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-navigation-symbol.svg';

import preloadMedia from '../../helpers/preloadMedia';
import Album from '../../models/Album';
import Picture from '../../models/Picture';
import { T } from '../../translations';
import DownloadDialog from '../DownloadDialog';

import './index.css';

type Direction = 'next' | 'previous' | 'album';
const keyMap: { [keyCode: number]: Direction } = {
  27: 'album', // escape
  33: 'previous', // page up
  34: 'next', // page down
  37: 'previous', // left arrow
  39: 'next', // right arrow
};

type PictureViewProps = RouteComponentProps<{ path: string }> & {
  album: Album;
  picture: Picture;
  fromAlbumView?: boolean;
};

interface PictureViewState {
  downloadDialogOpen: boolean;
}

class PictureView extends React.Component<PictureViewProps, PictureViewState> {
  state: PictureViewState = { downloadDialogOpen: false };

  render() {
    const t = T(r => r.PictureView);
    const { album, picture } = this.props;
    const { preview } = picture;
    const { downloadDialogOpen } = this.state;

    return (
      <div className="PictureView">
        <div
          className="PictureView-img"
          style={{
            backgroundImage: `url(${preview.src})`,
          }}
        />

        {picture.previous ? (
          <div
            onClick={() => this.goTo('previous')}
            className="PictureView-nav PictureView-nav-previous"
            title={t(r => r.previousPicture)}
          >
            <svg className="PictureView-icon">
              <use xlinkHref={`${navigationIcons}#ic_chevron_left_24px`} />
            </svg>
          </div>
        ) : null}

        {picture.next ? (
          <div onClick={() => this.goTo('next')} className="PictureView-nav PictureView-nav-next" title={t(r => r.nextPicture)}>
            <svg className="PictureView-icon">
              <use xlinkHref={`${navigationIcons}#ic_chevron_right_24px`} />
            </svg>
          </div>
        ) : null}

        <div onClick={() => this.goTo('album')} className="PictureView-action PictureView-action-exit" title={t(r => r.backToAlbum)}>
          <svg className="PictureView-icon">
            <use xlinkHref={`${navigationIcons}#ic_close_24px`} />
          </svg>
        </div>

        {album.is_downloadable && picture.original ? (
          <div
            onClick={this.openDownloadDialog}
            className="PictureView-action PictureView-action-download"
            title={t(r => r.downloadOriginal)}
          >
            <svg className="PictureView-icon">
              <use xlinkHref={`${editorIcons}#ic_vertical_align_bottom_24px`} />
            </svg>
            <DownloadDialog
              t={T(r => r.DownloadDialog)}
              album={album}
              onAccept={this.downloadPicture}
              onClose={this.closeDownloadDialog}
              isOpen={downloadDialogOpen}
            />
          </div>
        ) : null}
      </div>
    );
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);

    this.preloadPreviousAndNext(this.props.picture);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  componentDidUpdate(prevProps: PictureViewProps) {
    if (this.props.picture.path !== prevProps.picture.path) {
      this.preloadPreviousAndNext(this.props.picture);
    }
  }

  preloadPreviousAndNext(picture: Picture) {
    // use setTimeout to not block rendering of current picture – improves visible latency
    setTimeout(() => {
      if (picture.previous) {
        preloadMedia(picture.previous);
      }

      if (picture.next) {
        preloadMedia(picture.next);
      }
    }, 0);
  }

  onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.key === 'r' || event.key === 'R') {
      this.props.history.push('/random');
      return;
    }

    const direction = keyMap[event.keyCode];
    if (direction) {
      this.goTo(direction);
    }
  };

  goTo(direction: Direction) {
    // TODO hairy due to refactoring .album away from picture, ameliorate
    const { album, picture, fromAlbumView, history } = this.props;
    const destination = direction === 'album' ? album : picture[direction];
    if (destination) {
      if (direction === 'album') {
        if (fromAlbumView) {
          // arrived from album view
          // act as the browser back button
          history.goBack();
        } else {
          // arrived using direct link
          history.push(destination.path);
        }
      } else {
        history.replace(destination.path);
      }
    }
  }

  // XXX Whytf is setTimeout required here?
  closeDownloadDialog = () => {
    setTimeout(() => this.setState({ downloadDialogOpen: false }), 0);
  };
  openDownloadDialog = () => {
    this.setState({ downloadDialogOpen: true });
  };
  downloadPicture = () => {
    window.open(this.props.picture.original.src);
  };
}

export default withRouter(PictureView);
