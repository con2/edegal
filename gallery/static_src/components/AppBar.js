import MuiAppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import UserAvatar from './UserAvatar';
import {toggleDrawer} from '../modules/ui';


const AppBar = ({onLeftButtonClick}) => (
  <MuiAppBar
    title="Edegal"
    iconElementLeft={
      <IconButton onClick={onLeftButtonClick}>
        <MenuIcon />
      </IconButton>
    }
    iconElementRight={
      <div>
        <Link to="/user"><UserAvatar /></Link>
      </div>
    }
  />
);


AppBar.propTypes = {
  onLeftButtonClick: PropTypes.func.isRequired,
  currentViewTitle: PropTypes.string,
};


const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
  onLeftButtonClick: () => dispatch(toggleDrawer()),
});


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppBar);
