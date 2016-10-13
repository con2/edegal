'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Gallery from './components/Gallery';
import styles from './styles/index.css';
import muiTheme from './styles/muiTheme';
import {navigate} from './actions';
import store from './store';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();


render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={muiTheme}>
      <Gallery />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('root')
);

store.dispatch(navigate('/'));
