import 'isomorphic-fetch';

import injectTapEventPlugin from 'react-tap-event-plugin';
import React from 'react';
import ReactDOM from 'react-dom';
import {IndexRoute, Router, Route, browserHistory} from 'react-router';
import {Provider} from 'react-redux';
import {syncHistoryWithStore} from 'react-router-redux';
import {ReduxAsyncConnect} from 'redux-connect';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import './styles/index.css';
import MainView from './components/MainView';
import Gallery from './components/Gallery';
import muiTheme from './styles/muiTheme';
import initializeStore from './store';


// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();


const
  store = initializeStore(),
  history = syncHistoryWithStore(browserHistory, store);


// store.dispatch(getConfig());


ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={muiTheme}>
      <Router render={(props) => <ReduxAsyncConnect {...props} />} history={history}>
        <Route path="/" component={Gallery}>
          <IndexRoute component={MainView} />
          <Route path="*" component={MainView} />
        </Route>
      </Router>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('root')
);
