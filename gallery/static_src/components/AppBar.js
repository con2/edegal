import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import MuiAppBar from 'material-ui/AppBar';
import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import UserAvatar from './UserAvatar';


const linkStyle = {
  textDecoration: 'none',
  color: 'white',
};


@connect(
  state => ({
    path: state.edegal.getIn(['album', 'path']),
    title: state.edegal.getIn(['album', 'title']),
    breadcrumb: state.edegal.getIn(['album', 'breadcrumb']),
  }),
  {}
)
export default class AppBar extends React.Component {
  static propTypes = {
    breadcrumb: ImmutablePropTypes.list,
    path: PropTypes.string,
    title: PropTypes.string,
  }

  render() {
    const {path, title, breadcrumb} = this.props;
    const fullBreadcrumb = breadcrumb.push(Immutable.fromJS({path, title}));
    const lastIndex = fullBreadcrumb.count() - 1;

    return (
      <MuiAppBar
        title={fullBreadcrumb.map((item, index) => (
          <span key={item.get('path')}>
            <Link
              to={item.get('path')}
              style={linkStyle}
            >
              {item.get('title')}
            </Link>
            {index !== lastIndex ? ' » ' : null}
          </span>
        ))}
        iconElementRight={<Link to="/user"><UserAvatar /></Link>}
      />
    );
  }
}
