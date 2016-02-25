'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import injectTapEventPlugin from 'react-tap-event-plugin';

import galleryApp from './reducers';
import Gallery from './components/Gallery';
import styles from './styles/index.css';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();


const
    store = createStore(galleryApp);

render(
  <Provider store={store}>
    <Gallery />
  </Provider>,
  document.getElementById('root')
)