import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import MainView from './components/MainView';
import './translations';

export default class App extends React.Component<{}, {}> {
  render() {
    return (
      <Router>
        <>
          <Switch>
            {/* XXX why is match.path always /? */}
            <Route component={MainView} />
          </Switch>
        </>
      </Router>
    );
  }
}
