import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import NavigateNext from 'material-ui/svg-icons/navigation/chevron-right';
import NavigatePrevious from 'material-ui/svg-icons/navigation/chevron-left';
import Close from 'material-ui/svg-icons/navigation/close';
import { blue50 } from 'material-ui/styles/colors';

import selectMedia from '../../helpers/selectMedia';
import preloadMedia from '../../helpers/preloadMedia';
import Picture from '../../models/Picture';
import { State } from '../../modules';

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
const iconSize = { width: navigationWidth, height: navigationWidth };


interface PictureViewOwnProps {}
interface PictureViewStateProps {
  picture: Picture;
}
interface PictureViewDispatchProps {
  push: typeof push;
}
interface PictureViewState {}
type PictureViewProps = PictureViewOwnProps & PictureViewStateProps & PictureViewDispatchProps;


class PictureView extends React.Component<PictureViewProps, PictureViewState> {
  render() {
    const {picture} = this.props;
    const preview = selectMedia(picture);

    return (
      <div className="PictureView">
        <div
          className="PictureView-img"
          style={{
            backgroundImage: `url(${preview.src})`
          }}
        />

        {picture.previous ? (
          <div onClick={() => this.goTo('previous')} className="PictureView-nav PictureView-nav-previous">
            <NavigatePrevious color={blue50} style={iconSize} className="PictureView-icon" />
          </div>
        ) : null}

        {picture.next ? (
          <div onClick={() => this.goTo('next')} className="PictureView-nav PictureView-nav-next">
            <NavigateNext color={blue50} style={iconSize} className="PictureView-icon" />
          </div>
        ) : null}

        <div onClick={() => this.goTo('album')} className="PictureView-exit">
          <Close color={blue50} style={iconSize} />
        </div>
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

  componentWillReceiveProps(nextProps: PictureViewProps) {
    this.preloadPreviousAndNext(nextProps.picture);
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

const mapDispatchToProps = { push };


export default connect<PictureViewStateProps, PictureViewDispatchProps, PictureViewOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(PictureView);
