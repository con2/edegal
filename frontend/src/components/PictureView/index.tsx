import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import NavigateNext from 'material-ui/svg-icons/navigation/chevron-right';
import NavigatePrevious from 'material-ui/svg-icons/navigation/chevron-left';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import Close from 'material-ui/svg-icons/navigation/close';
import { blue50 } from 'material-ui/styles/colors';

import DownloadDialog from '../DownloadDialog';
import selectMedia from '../../helpers/selectMedia';
import preloadMedia from '../../helpers/preloadMedia';
import Picture from '../../models/Picture';
import Media, { nullMedia } from '../../models/Media';
import { State } from '../../modules';
import { openDownloadDialog } from '../../modules/downloadDialog';

import './index.css';


type Direction = 'next' | 'previous' | 'album';
const keyMap: {[keyCode: number]: Direction} = {
  27: 'album',    // escape
  33: 'previous', // page up
  34: 'next',     // page down
  37: 'previous', // left arrow
  39: 'next',     // right arrow
};

const iconColor = blue50;
const navigationWidth = 60;
const iconSize = { width: navigationWidth, height: navigationWidth };


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
            <NavigatePrevious color={iconColor} style={iconSize} className="PictureView-icon-fade" />
          </div>
        ) : null}

        {picture.next ? (
          <div
            onClick={() => this.goTo('next')}
            className="PictureView-nav PictureView-nav-next"
            title="Seuraava"
          >
            <NavigateNext color={iconColor} style={iconSize} className="PictureView-icon-fade" />
          </div>
        ) : null}

        <div
          onClick={() => this.goTo('album')}
          className="PictureView-action PictureView-action-exit"
          title="Takaisin albumiin"
        >
          <Close color={iconColor} style={iconSize} />
        </div>

        {picture.original && (
          picture.terms_and_conditions ? (
            <div
              onClick={this.props.openDownloadDialog}
              className="PictureView-action PictureView-action-download"
              title="Lataa kuva"
            >
              <FileDownload color={iconColor} style={iconSize} />
              <DownloadDialog />
            </div>
          ) : (
            <a
              href={picture.original.src}
              className="PictureView-action PictureView-action-download"
              title="Lataa kuva"
            >
              <FileDownload color={iconColor} style={iconSize} />
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
