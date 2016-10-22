import MuiAppBar from 'material-ui/AppBar';
import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import UserAvatar from './UserAvatar';


const AppBar = () => (
  <MuiAppBar
    title="Edegal"
    iconElementRight={
      <div>
        <Link to="/user"><UserAvatar /></Link>
      </div>
    }
  />
);


AppBar.propTypes = {
  currentViewTitle: PropTypes.string,
};


const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
});


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppBar);
