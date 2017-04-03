import * as React from 'react';

import selectMedia from '../helpers/selectMedia';
import Picture from '../models/Picture';


interface PictureViewProps {
  picture: Picture;
}
interface PictureViewState {}


export default class Album extends React.Component<PictureViewProps, PictureViewState> {
  render() {
    const {picture} = this.props;
    const preview = selectMedia(picture);

    return <img src={preview.src} alt={picture.title} />;
  }
}
