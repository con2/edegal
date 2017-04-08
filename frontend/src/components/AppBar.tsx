import MuiAppBar from 'material-ui/AppBar';
import * as React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import UserAvatar from './UserAvatar';
import Breadcrumb from '../models/Breadcrumb';
import { State } from '../modules';


const linkStyle = {
  textDecoration: 'none',
  color: 'white',
};
const breadcrumbSeparator = ' » ';


interface AppBarStateProps {
  breadcrumb: Breadcrumb[];
  path: string;
  title: string;
}
interface AppBarDispatchProps {}
interface AppBarOwnProps {}
interface AppBarState {}
type AppBarProps = AppBarStateProps & AppBarDispatchProps & AppBarOwnProps;


class AppBar extends React.Component<AppBarProps, AppBarState> {
  render() {
    const {path, title, breadcrumb} = this.props;
    const fullBreadcrumb = breadcrumb.concat([{path, title}]);
    const lastIndex = fullBreadcrumb.length - 1;

    document.title = fullBreadcrumb.map(crumb => crumb.title).join(breadcrumbSeparator);

    return (
      <MuiAppBar
        title={fullBreadcrumb.map((item, index) => (
          <span key={item.path}>
            <Link
              to={item.path}
              style={linkStyle}
            >
              {item.title}
            </Link>
            {index !== lastIndex ? breadcrumbSeparator : null}
          </span>
        ))}
        iconElementLeft={<div/>}
        iconElementRight={<Link to="/user"><UserAvatar /></Link>}
      />
    );
  }
}


const mapStateToProps = (state: State) => ({
  path: state.album.path,
  title: state.album.title,
  breadcrumb: state.album.breadcrumb,
});

const mapDispatchToProps = {};


export default connect<AppBarStateProps, AppBarDispatchProps, AppBarOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(AppBar);
