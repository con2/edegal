import {connect} from 'react-redux';

import Gravatar from './Gravatar';


const mapStateToProps = state => ({
  name: state.edegal.getIn(['config', 'user', 'displayName']),
  email: state.edegal.getIn(['config', 'user', 'email']),
});

const mapDispatchToProps = () => ({});


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Gravatar);
