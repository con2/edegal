import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';

import rootReducer, { Action, State } from './modules';
import { initialize } from './modules/initialization';


export const history = createBrowserHistory();

// tslint:disable-next-line:no-any
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


const store = createStore<State, Action, {}, {}> (
  connectRouter(history)(rootReducer as any),
  composeEnhancers(
    applyMiddleware(
      routerMiddleware(history),
      thunk,
    ),
  ),
);


store.dispatch(initialize() as any);


export default store;
