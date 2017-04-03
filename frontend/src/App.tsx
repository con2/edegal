import * as React from 'react';
import { Component } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute } from 'react-router';
import * as injectTapEventPlugin from 'react-tap-event-plugin';

import { applyMiddleware, createStore, combineReducers, compose } from 'redux';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';
import thunk from 'redux-thunk';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import reducers, { State } from './modules';
import Gallery from './components/Gallery';
import MainView from './components/MainView';
import muiTheme from './styles/muiTheme';

import './styles/index.css';


// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();


const routingMiddleware = routerMiddleware(browserHistory);

// tslint:disable-next-line:no-any
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const enhancers = composeEnhancers(
  applyMiddleware(thunk),
  applyMiddleware(routingMiddleware),
);
const store = createStore<State>(combineReducers<State>(reducers), enhancers);
const history = syncHistoryWithStore(browserHistory, store);


export default class App extends Component<null, null> {
  render() {
    return (
      <Provider store={store}>
        <MuiThemeProvider muiTheme={muiTheme}>
          <Router history={history}>
            <Route path="/" component={Gallery}>
              <IndexRoute component={MainView} />
              <Route path="*" component={MainView} />
            </Route>
          </Router>
        </MuiThemeProvider>
      </Provider>
    );
  }
}
