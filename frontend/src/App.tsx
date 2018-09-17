import { ConnectedRouter } from 'connected-react-router';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';

import MainView from './components/MainView';
import store, { history } from './store';


export default class App extends React.Component<{}, {}> {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div>
            <Switch>
              <Route render={() => <MainView />} />
            </Switch>
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}
