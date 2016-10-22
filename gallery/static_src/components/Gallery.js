import React from 'react';

import Header from './Header';
import AlbumContainer from '../containers/AlbumContainer';


const Gallery = ({album}) => (
  <div>
    <Header />
    <AlbumContainer />
  </div>
);


export default Gallery;
