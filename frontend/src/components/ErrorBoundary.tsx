import React from 'react';
import ErrorMessage from './ErrorMessage';
import { T } from '../translations';

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    // TODO Error message
    const t = T(r => r.ErrorBoundary);
    return this.state.error ? <ErrorMessage>{t(r => r.defaultMessage)}</ErrorMessage> : this.props.children;
  }
}
