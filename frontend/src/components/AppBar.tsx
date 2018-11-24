import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { NamespacesConsumer } from 'react-i18next';
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

    document.title = fullBreadcrumb.map(crumb => crumb.title).join(breadcrumbSeparator);

    const rootAlbum = fullBreadcrumb.shift();

    return (
      <NamespacesConsumer ns={['AppBar']}>
        {(t) => (
          <nav className="navbar navbar-expand-md navbar-dark navbar-fixed-top">
            <Link className="navbar-brand" to={rootAlbum!.path}>{rootAlbum!.title}</Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav mr-auto">
                {fullBreadcrumb.map((item) => (
                  <li key={item.path} className="nav-item">
                    <Link className="nav-link" to={item.path}>{breadcrumbSeparator}{item.title}</Link>
                  </li>
                ))}
              </ul>
              <ul className="navbar-nav">
                <li className="navbar-item">
                  <a href={Config.loginUrl} className="nav-link">{t('adminLink')}</a>
                </li>
              </ul>
            </div>
          </nav>
        )}
      </NamespacesConsumer>
    );
  }
}


const mapStateToProps = (state: State) => ({
  path: state.album.path,
  title: state.album.title,
  breadcrumb: state.album.breadcrumb,
});


export default connect(mapStateToProps)(AppBar);
