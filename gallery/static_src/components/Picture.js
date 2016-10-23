import ImmutablePropTypes from 'react-immutable-proptypes';
import React from 'react';


export default class Album extends React.Component {
  static propTypes = {
    picture: ImmutablePropTypes.map,
  }

  render() {
    const {picture} = this.props;

    return (
      <p>{JSON.stringify(picture)}</p>
    );
  }
}
