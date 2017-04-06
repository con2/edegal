import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import NavigateNext from 'material-ui/svg-icons/navigation/chevron-right';
import NavigatePrevious from 'material-ui/svg-icons/navigation/chevron-left';
import Close from 'material-ui/svg-icons/navigation/close';

import selectMedia from '../helpers/selectMedia';
import Picture from '../models/Picture';
import { State } from '../modules';

import { blue50 } from 'material-ui/styles/colors';


const previousPictureKeycodes = [
  37, // left arrow
  33, // page up
];
const nextPictureKeycodes = [
  39, // right arrow
  34, // page down
];

const navigationWidth = 60;


interface PictureViewOwnProps {
  picture: Picture;
}
interface PictureViewStateProps {}
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
      <div
        style={{
          position: 'fixed',
          display: 'grid',
          gridTemplateColumns: `${navigationWidth}px 1fr ${navigationWidth}px`,
          gridTemplateRows: `${navigationWidth}px 1fr ${navigationWidth}px`,
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          padding: 0,
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          backgroundColor: 'black',
        }}
      >
        <img
          src={preview.src}
          alt={picture.title}
          style={{
            gridRow: '1 / span 3',
            gridColumn: '1 / span 3',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        />

        {picture.previous ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              gridRow: '1 / span 3',
              gridColumn: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 1,
            }}
            onClick={() => this.goTo('previous')}
          >
            <NavigatePrevious color={blue50} style={{ width: navigationWidth, height: navigationWidth }} />
          </div>
        ) : null}

        {picture.next ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              gridRow: '1 / span 3',
              gridColumn: 3,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 1,
            }}
            onClick={() => this.goTo('next')}
          >
            <NavigateNext color={blue50} style={{ width: navigationWidth, height: navigationWidth }} />
          </div>
        ) : null}

        <div
          style={{
            width: '100%',
            height: '100%',
            gridRow: 1,
            gridColumn: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 2,
          }}
          onClick={() => this.goTo('album')}
        >
          <Close color={blue50} style={{ width: navigationWidth, height: navigationWidth }} />
        </div>
      </div>
    );
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (nextPictureKeycodes.indexOf(event.keyCode) >= 0) {
      this.goTo('next');
    } else if (previousPictureKeycodes.indexOf(event.keyCode) >= 0) {
      this.goTo('previous');
    }
  }

  goTo(direction: 'next' | 'previous' | 'album') {
    const { picture } = this.props;
    const destination = picture[direction];
    if (destination) {
      this.props.push(destination.path);
    }
  }
}


const mapStateToProps = (state: State) => ({});

const mapDispatchToProps = { push };


export default connect<PictureViewStateProps, PictureViewDispatchProps, PictureViewOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(PictureView);
