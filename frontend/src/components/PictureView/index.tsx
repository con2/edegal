import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import DownloadDialog from '../DownloadDialog';
import selectMedia from '../../helpers/selectMedia';
import preloadMedia from '../../helpers/preloadMedia';
import Picture from '../../models/Picture';
import Media, { nullMedia } from '../../models/Media';
import { State } from '../../modules';
import { openDownloadDialog } from '../../modules/downloadDialog';

import './index.css';


type Direction = 'next' | 'previous' | 'album';
const keyMap: {[keyCode: number]: Direction} = {
  27: 'album',    // escape
  33: 'previous', // page up
  34: 'next',     // page down
  37: 'previous', // left arrow
  39: 'next',     // right arrow
};

const navigationWidth = 60;


interface PictureViewOwnProps {}
interface PictureViewStateProps {
  picture: Picture;
}
interface PictureViewDispatchProps {
  push: typeof push;
  openDownloadDialog: typeof openDownloadDialog;
}
interface PictureViewState {
  preview: Media;
}
type PictureViewProps = PictureViewOwnProps & PictureViewStateProps & PictureViewDispatchProps;


class PictureView extends React.Component<PictureViewProps, PictureViewState> {
  state = {
    preview: nullMedia,
  };

  render() {
    const { picture } = this.props;
    const { preview } = this.state;

    return (
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
            title="Edellinen"
          >
            Edellinen
          </div>
        ) : null}

        {picture.next ? (
          <div
            onClick={() => this.goTo('next')}
            className="PictureView-nav PictureView-nav-next"
            title="Seuraava"
          >
            Seuraava
          </div>
        ) : null}

        <div
          onClick={() => this.goTo('album')}
          className="PictureView-action PictureView-action-exit"
          title="Takaisin albumiin"
        >
          Sulje
        </div>

        {picture.original && (
          picture.album!.terms_and_conditions ? (
            <div
              onClick={this.props.openDownloadDialog}
              className="PictureView-action PictureView-action-download"
              title="Lataa kuva"
            >
              Lataa kuva
              <DownloadDialog />
            </div>
          ) : (
            <a
              href={picture.original.src}
              className="PictureView-action PictureView-action-download"
              title="Lataa kuva"
            >
              Lataa kuva
            </a>
          )
        )}

      </div>
    );
  }

  componentWillMount() {
    // preview needed before render
    this.selectMedia(this.props.picture);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('resize', this.onResize);

    this.preloadPreviousAndNext(this.props.picture);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('keydown', this.onKeyDown);
  }

  componentWillReceiveProps(nextProps: PictureViewProps) {
    if (nextProps.picture.path !== this.props.picture.path) {
      this.selectMedia(nextProps.picture);
      this.preloadPreviousAndNext(nextProps.picture);
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

  selectMedia(picture: Picture) {
    const preview = selectMedia(picture);
    this.setState({ preview });
  }

  onResize = () => {
    this.selectMedia(this.props.picture);
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
    const { picture } = this.props;
    const destination = picture[direction];
    if (destination) {
      this.props.push(destination.path);
    }
  }
}


const mapStateToProps = (state: State) => ({
  picture: state.picture,
});

const mapDispatchToProps = { push, openDownloadDialog };


export default connect<PictureViewStateProps, PictureViewDispatchProps, PictureViewOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(PictureView);
