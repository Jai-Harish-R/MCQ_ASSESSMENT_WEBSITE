import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  name: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in ${this.props.name}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', margin: '24px', backgroundColor: '#fef2f2', border: '1px solid #ef4444', borderRadius: '12px' }}>
          <h2 style={{ color: '#b91c1c', marginTop: 0 }}>Something went wrong in {this.props.name}</h2>
          <pre style={{ color: '#7f1d1d', whiteSpace: 'pre-wrap', fontSize: '13px', overflowX: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ color: '#991b1b', whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '12px' }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
