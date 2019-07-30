import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Translation } from 'react-i18next';
import Config from '../../Config';
import Breadcrumb from '../../models/Breadcrumb';
import { State } from '../../modules';

import './index.css';

const breadcrumbSeparator = ' » ';


export interface AppBarAction {
  label: string;
  onClick?(): void;
}


interface AppBarProps {
  breadcrumb: Breadcrumb[];
  path: string;
  title: string;
  actions?: AppBarAction[];
}


class AppBar extends React.Component<AppBarProps, {}> {
  render() {
    const { path, title, breadcrumb, actions } = this.props;
    const fullBreadcrumb = breadcrumb.concat([{ path, title }]);

    document.title = fullBreadcrumb.map(crumb => crumb.title).join(breadcrumbSeparator);

    const rootAlbum = fullBreadcrumb.shift();

    return (
      <Translation ns={['AppBar']}>
        {(t) => (
          <nav className="AppBar navbar navbar-expand-md navbar-dark navbar-fixed-top">
            <Link className="navbar-brand" to={rootAlbum!.path}>{rootAlbum!.title}</Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#AppBar-navbar" aria-controls="AppBar-navbar" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="AppBar-navbar">
              <ul className="navbar-nav mr-auto">
                {fullBreadcrumb.map((item) => (
                  <li key={item.path} className="nav-item">
                    <Link className="nav-link" to={item.path}>{breadcrumbSeparator}{item.title}</Link>
                  </li>
                ))}
              </ul>
              <ul className="navbar-nav">
                {(actions || []).map(action => (
                  <li key={action.label} className="nav-item">
                    <button className="btn btn-link nav-link" onClick={action.onClick}>{action.label}</button>
                  </li>
                ))}
                <li className="nav-item">
                  <a href={Config.loginUrl} className="nav-link AppBar-adminLink">{t('adminLink')}</a>
                </li>
              </ul>
            </div>
          </nav>
        )}
      </Translation>
    );
  }
}


const mapStateToProps = (state: State) => ({
  path: state.album.path,
  title: state.album.title,
  breadcrumb: state.album.breadcrumb,
});


export default connect(mapStateToProps)(AppBar);
