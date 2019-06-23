import { replace as replaceState, push as pushState, goBack } from 'connected-react-router';
import * as React from 'react';
import { Translation } from 'react-i18next';
import { connect } from 'react-redux';

import editorIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-editor-symbol.svg';
import navigationIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-navigation-symbol.svg';

import preloadMedia from '../../helpers/preloadMedia';
import Album from '../../models/Album';
import Picture from '../../models/Picture';
import { State } from '../../modules';

import './index.css';
import DownloadDialog from './DownloadDialog';


type Direction = 'next' | 'previous' | 'album';
const keyMap: {[keyCode: number]: Direction} = {
  27: 'album',    // escape
  33: 'previous', // page up
  34: 'next',     // page down
  37: 'previous', // left arrow
  39: 'next',     // right arrow
};


interface PictureViewStateProps {
  album: Album;
  picture: Picture;
  fromAlbumView: boolean;
}

interface PictureViewDispatchProps {
  replaceState: typeof replaceState;
  pushState: typeof pushState;
  goBack: typeof goBack;
}

type PictureViewProps = PictureViewStateProps & PictureViewDispatchProps;

interface PictureViewState {
  downloadDialogOpen: boolean;
}


class PictureView extends React.Component<PictureViewProps, PictureViewState> {
  state: PictureViewState = { downloadDialogOpen: false };

  render() {
    const { album, picture } = this.props;
    const { preview } = picture;
    const { downloadDialogOpen } = this.state;

    return (
      <Translation ns="PictureView">
        {(t) => (
          <div className="PictureView">
            <div
              className="PictureView-img"
              style={{
                backgroundImage: `url(${preview.src})`
              }}
            />

            {picture.previous ? (
              <div
                onClick={() => this.goTo('previous')}
                className="PictureView-nav PictureView-nav-previous"
                title={t('previousPicture')}
              >
                <svg className="PictureView-icon">
                  <use xlinkHref={`${navigationIcons}#ic_chevron_left_24px`} />
                </svg>
              </div>
            ) : null}

            {picture.next ? (
              <div
                onClick={() => this.goTo('next')}
                className="PictureView-nav PictureView-nav-next"
                title={t('nextPicture')}
              >
                <svg className="PictureView-icon">
                  <use xlinkHref={`${navigationIcons}#ic_chevron_right_24px`} />
                </svg>
              </div>
            ) : null}

            <div
              onClick={() => this.goTo('album')}
              className="PictureView-action PictureView-action-exit"
              title={t('backToAlbum')}
            >
              <svg className="PictureView-icon">
                <use xlinkHref={`${navigationIcons}#ic_close_24px`} />
              </svg>
            </div>

            {picture.original && (
              <div
                onClick={this.openDownloadDialog}
                className="PictureView-action PictureView-action-download"
                title={t('downloadOriginal')}
              >
                <svg className="PictureView-icon">
                  <use xlinkHref={`${editorIcons}#ic_vertical_align_bottom_24px`} />
                </svg>
                {downloadDialogOpen ? <DownloadDialog album={album} picture={picture} onClose={this.closeDownloadDialog} /> : null}
              </div>
            )}
          </div>
        )}
      </Translation>
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

    const direction = keyMap[event.keyCode];
    if (direction) {
      this.goTo(direction);
    }
  }

  goTo(direction: Direction) {
    // TODO hairy due to refactoring .album away from picture, ameliorate
    const { album, picture, fromAlbumView } = this.props;
    const destination = direction === 'album' ? album : picture[direction];
    if (destination) {
      if (direction === 'album') {
        if (fromAlbumView) {
          // arrived from album view
          // act as the browser back button
          this.props.goBack();
        } else {
          // arrived using direct link
          this.props.pushState(destination.path);
        }
      } else {
        this.props.replaceState(destination.path);
      }
    }
  }

  openDownloadDialog = () => {
    this.setState({ downloadDialogOpen: true });
  }

  closeDownloadDialog = () => {
    // XXX Whytf is setTimeout required here?
    setTimeout(() => this.setState({ downloadDialogOpen: false }), 0);
  }
}


const mapStateToProps = (state: State) => ({
  album: state.album,
  picture: state.picture,
  width: state.mainView.width,
  fromAlbumView: state.router.location.state ? state.router.location.state.fromAlbumView : false,
});

const mapDispatchToProps = { replaceState, pushState, goBack };


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PictureView);
