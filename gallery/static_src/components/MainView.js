import {asyncConnect} from 'redux-connect';
import {connect} from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import React, {PropTypes} from 'react';

import {getAlbum} from '../modules/album';
import Album from './Album';
import Picture from './Picture';
import Loading from './Loading';


@asyncConnect([{
  promise: ({params: {splat}, store}) => store.dispatch(getAlbum(`/${splat || ''}`)),
}])
@connect(
  state => ({
    mainView: state.edegal.get('mainView'),
    album: state.edegal.get('album'),
    picture: state.edegal.get('picture'),
  }),
  {}
)
export default class MainView extends React.Component {
  static propTypes = {
    mainView: PropTypes.string,
    album: ImmutablePropTypes.map,
    picture: ImmutablePropTypes.map,
  }

  render() {
    const {mainView, album, picture} = this.props;

    if (mainView === 'album') {
      return <Album album={album} />;
    } else if (mainView === 'picture') {
      return <Picture picture={picture} />;
    } else {
      return <Loading />;
    }
  }
}
