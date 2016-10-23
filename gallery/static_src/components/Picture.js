import ImmutablePropTypes from 'react-immutable-proptypes';
import React from 'react';

import {selectMedia} from '../helpers/media';


export default class Album extends React.Component {
  static propTypes = {
    picture: ImmutablePropTypes.map,
  }

  render() {
    const
      {picture} = this.props,
      preview = selectMedia(picture);

    return (
      <img src={preview.get('src')} alt={picture.get('title')} />
    );
  }
}
