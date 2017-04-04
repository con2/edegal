import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import selectMedia from '../helpers/selectMedia';
import Picture from '../models/Picture';
import { State } from '../modules';


const previousPictureKeycodes = [
  37, // left arrow
  33, // page up
];
const nextPictureKeycodes = [
  39, // right arrow
  34, // page down
];


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

    return <img src={preview.src} alt={picture.title} style={{ width: '100%' }} />;
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

    if(nextPictureKeycodes.indexOf(event.keyCode) >= 0) {
      this.goTo('next');
    } else if (previousPictureKeycodes.indexOf(event.keyCode) >= 0) {
      this.goTo('previous');
    }
  }

  goTo(direction: 'next' | 'previous') {
    const { picture } = this.props;
    const targetPicture = picture[direction];
    if (targetPicture) {
      this.props.push(targetPicture.path);
    }
  }
}


const mapStateToProps = (state: State) => ({});

const mapDispatchToProps = { push };


export default connect<PictureViewStateProps, PictureViewDispatchProps, PictureViewOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(PictureView);
