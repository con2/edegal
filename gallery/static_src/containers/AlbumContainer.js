import {connect} from 'react-redux';

import Album from '../components/Album';


const mapStateToProps = (state) => ({
  subalbums: state ? state.subalbums : [],
  pictures: state ? state.pictures : [],
});
const mapDispatchToProps = (dispatch) => ({});

const AlbumContainer = connect(mapStateToProps, mapDispatchToProps)(Album);

export default AlbumContainer;
