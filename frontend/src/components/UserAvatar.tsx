import {connect} from 'react-redux';

import Gravatar, { GravatarProps } from './Gravatar';
import { State } from '../modules';


const mapStateToProps = (state: State) => ({
  name: state.user.displayName,
  email: state.user.email,
});

const mapDispatchToProps = () => ({});


export default connect<GravatarProps, {}, {}>(
  mapStateToProps,
  mapDispatchToProps
)(Gravatar);
