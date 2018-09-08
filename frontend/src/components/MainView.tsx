import * as React from 'react';
import { connect } from 'react-redux';

import { State } from '../modules';
import { getAlbum } from '../modules/album';
import { MainViewMode, mainViewResized } from '../modules/mainView';
import AlbumView from './AlbumView';
import Loading from './Loading';
import PictureView from './PictureView';


interface MainViewStateProps {
  mode: MainViewMode;
  path: string;
  width: number;
}
interface MainViewDispatchProps {
  getAlbum: typeof getAlbum;
  mainViewResized: typeof mainViewResized;
}
type MainViewProps = MainViewStateProps & MainViewDispatchProps;


class MainView extends React.Component<MainViewProps, {}> {
  render() {
    const { mode, path } = this.props;

    switch (mode) {
      case 'album':
        return <AlbumView key={path} />;
      case 'picture':
        return <PictureView key={path} />;
      default:
        return <Loading />;
    }
  }

  handleResize = () => {
    const newWidth = document.documentElement.clientWidth;

    if (newWidth !== this.props.width) {
      this.props.mainViewResized(newWidth);
    }
  }

  componentDidMount() {
    this.props.getAlbum(this.props.path);
    this.props.mainViewResized(document.documentElement.clientWidth);

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
  width: state.mainView.width,
  path: state.router.location.pathname,
});

const mapDispatchToProps = { getAlbum, mainViewResized };


export default connect<MainViewStateProps, MainViewDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps,
)(MainView);
