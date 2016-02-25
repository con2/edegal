import {connect} from 'react-redux';

import Album from '../components/Album';


const mapStateToProps = (state) => ({
  subalbums: state.album ? state.album.subalbums : [],
  pictures: state.album ? state.album.pictures : [],
});
const mapDispatchToProps = (dispatch) => ({});

const AlbumContainer = connect(mapStateToProps, mapDispatchToProps)(Album);

export default AlbumContainer;
