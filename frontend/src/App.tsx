import { ConnectedRouter } from 'connected-react-router';
import * as React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';

import MainView from './components/MainView';
import store, { history } from './store';
import i18n from './translations';


export default class App extends React.Component<{}, {}> {
  render() {
    return (
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <ConnectedRouter history={history}>
            <div>
              <Switch>
                <Route render={() => <MainView />} />
              </Switch>
            </div>
          </ConnectedRouter>
        </I18nextProvider>
      </Provider>
    );
  }
}
