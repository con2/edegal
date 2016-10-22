import React, {PropTypes} from 'react';

import AppBar from './AppBar';


export default class Gallery extends React.Component {
  static propTypes = {
    children: PropTypes.element,
  }

  render() {
    const {children} = this.props;

    return (
      <div>
        <AppBar />
        {children}
      </div>
    );
  }
}
