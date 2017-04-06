import * as React from 'react';


interface GalleryProps {}
interface GalleryState {}


export default class Gallery extends React.Component<GalleryProps, GalleryState> {
  render() {
    const {children} = this.props;

    return (
      <div>
        {children}
      </div>
    );
  }
}
