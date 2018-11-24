import * as React from 'react';
import { connect } from 'react-redux';

import { State } from '../modules';
import { getAlbum } from '../modules/album';
import { MainViewMode, mainViewResized } from '../modules/mainView';
import AlbumView from './AlbumView';
import Loading from './Loading';
import PictureView from './PictureView';


interface MainViewStateProps {
  width: number;
  mode: MainViewMode;
  path: string;
  ready: boolean;
}
// XXX this method of typing dispatch props is cheating and a black hole
interface MainViewDispatchProps {
  getAlbum: typeof getAlbum;
  mainViewResized: typeof mainViewResized;
}
type MainViewProps = MainViewStateProps & MainViewDispatchProps;


class MainView extends React.Component<MainViewProps, {}> {
  render() {
    const { mode, path, ready } = this.props;

    if (!ready) {
      return <Loading />;
    }

    switch (mode) {
      case 'album':
        return <AlbumView key={path} />;
      case 'picture':
        return <PictureView key={path} />;
    }
  }

  handleResize = () => {
    const newWidth = document.documentElement!.clientWidth;

    if (newWidth !== this.props.width) {
      this.props.mainViewResized(newWidth);
    }
  }

  componentDidMount() {
    this.props.getAlbum(this.props.path);
    this.handleResize();

    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  componentDidUpdate(prevProps: MainViewProps) {
    if (prevProps.path !== this.props.path) {
      this.props.getAlbum(this.props.path);
    }
  }
}


const mapStateToProps = (state: State) => ({
  mode: state.mainView.mode,
  path: state.router.location.pathname,
  ready: state.ready,
  width: state.mainView.width,
});

const mapDispatchToProps = { getAlbum, mainViewResized };


export default connect<MainViewStateProps, MainViewDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(MainView);
