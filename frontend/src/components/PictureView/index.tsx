import { replace as replaceState, push as pushState, goBack } from 'connected-react-router';
import * as React from 'react';
import { NamespacesConsumer } from 'react-i18next';
import { connect } from 'react-redux';

import editorIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-editor-symbol.svg';
import navigationIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-navigation-symbol.svg';

import preloadMedia from '../../helpers/preloadMedia';
import Picture from '../../models/Picture';
import { State } from '../../modules';
import { openDownloadDialog } from '../../modules/downloadDialog';
// import DownloadDialog from '../DownloadDialog';

import './index.css';


type Direction = 'next' | 'previous' | 'album';
const keyMap: {[keyCode: number]: Direction} = {
  27: 'album',    // escape
  33: 'previous', // page up
  34: 'next',     // page down
  37: 'previous', // left arrow
  39: 'next',     // right arrow
};


interface PictureViewStateProps {
  picture: Picture;
  fromAlbumView: boolean;
}
interface PictureViewDispatchProps {
  replaceState: typeof replaceState;
  pushState: typeof pushState;
  goBack: typeof goBack;
  openDownloadDialog: typeof openDownloadDialog;
}
type PictureViewProps = PictureViewStateProps & PictureViewDispatchProps;


class PictureView extends React.PureComponent<PictureViewProps, {}> {
  render() {
    const { picture } = this.props;
    const { preview } = picture;

    return (
      <NamespacesConsumer ns="PictureView">
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
              picture.album!.terms_and_conditions ? (
                <a
                // <div
                  // onClick={this.props.openDownloadDialog}
                  href={picture.original.src}
                  className="PictureView-action PictureView-action-download"
                  title={t('downloadOriginal')}
                >
                  <svg className="PictureView-icon">
                    <use xlinkHref={`${editorIcons}#ic_vertical_align_bottom_24px`} />
                  </svg>
                  {/* <DownloadDialog /> */}
                </a>
              ) : (
                <a
                  href={picture.original.src}
                  className="PictureView-action PictureView-action-download"
                  title={t('downloadOriginal')}
                >
                  <svg className="PictureView-icon">
                    <use xlinkHref={`${editorIcons}#ic_vertical_align_bottom_24px`} />
                  </svg>
                </a>
              )
            )}
          </div>
        )}
      </NamespacesConsumer>
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
    const { picture, fromAlbumView } = this.props;
    const destination = picture[direction];
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
}


const mapStateToProps = (state: State) => ({
  picture: state.picture,
  width: state.mainView.width,
  fromAlbumView: state.router.location.state ? state.router.location.state.fromAlbumView : false,
});

const mapDispatchToProps = { replaceState, pushState, goBack, openDownloadDialog };


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PictureView);
