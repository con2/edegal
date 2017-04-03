import * as React from 'react';

import AppBar from './AppBar';


interface GalleryProps {}
interface GalleryState {}


export default class Gallery extends React.Component<GalleryProps, GalleryState> {
  render() {
    const {children} = this.props;

    return (
      <div>
        <AppBar />
        {children}
      </div>
    );
  }
}
