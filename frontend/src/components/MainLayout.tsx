import * as React from 'react';


interface MainLayoutProps {}
interface MainLayoutState {}


export default class MainLayout extends React.Component<MainLayoutProps, MainLayoutState> {
  render() {
    return <div>{this.props.children}</div>;
  }
}
