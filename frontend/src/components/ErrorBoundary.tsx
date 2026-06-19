import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px', background: 'var(--bg)', color: 'var(--text-primary)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Ops, algo deu errado!</h2>
          <p style={{ color: 'var(--red)', background: 'var(--red-bg)', padding: '10px', borderRadius: '8px', maxWidth: '600px', wordBreak: 'break-all' }}>{this.state.error?.message}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Recarregar página</button>
        </div>
      );
    }

    return this.props.children;
  }
}
