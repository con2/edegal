import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Config from '../Config';
import Breadcrumb from '../models/Breadcrumb';
import { State } from '../modules';


const breadcrumbSeparator = ' » ';


interface AppBarProps {
  breadcrumb: Breadcrumb[];
  path: string;
  title: string;
}


class AppBar extends React.Component<AppBarProps, {}> {
  render() {
    const { path, title, breadcrumb } = this.props;
    const fullBreadcrumb = breadcrumb.concat([{ path, title }]);
    const rootAlbum = fullBreadcrumb.shift();

    document.title = fullBreadcrumb.map(crumb => crumb.title).join(breadcrumbSeparator);

    return (
      <nav className="navbar navbar-dark navbar-fixed-top">
        <Link className="navbar-brand" to={rootAlbum!.path}>{rootAlbum!.title}</Link>
        <ul className="navbar-nav mr-auto">
          {fullBreadcrumb.map((item) => (
            <li key={item.path} className="nav-item">
              <Link className="nav-link" to={item.path}>{breadcrumbSeparator}{item.title}</Link>
            </li>
          ))}
        </ul>
        <ul className="navbar-nav">
          <li className="navbar-item">
            <a href={Config.loginUrl} className="nav-link">Admin</a>
          </li>
        </ul>
      </nav>
    );
  }
}


const mapStateToProps = (state: State) => ({
  path: state.album.path,
  title: state.album.title,
  breadcrumb: state.album.breadcrumb,
});


export default connect<AppBarProps>(mapStateToProps)(AppBar);
