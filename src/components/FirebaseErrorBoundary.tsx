'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary for Firebase operations
 * Catches and displays errors in learning content and progress operations
 */
export class FirebaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 Firebase Error Boundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Firebase Error Boundary details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>
            🚨 Something went wrong
          </h3>
          <p style={{ color: '#6c757d', textAlign: 'center', marginBottom: '15px' }}>
            There was an error loading this content. This might be a temporary issue with Firebase.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ 
              marginTop: '15px', 
              padding: '10px', 
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              width: '100%',
              maxWidth: '500px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Debug Info (Development Only)
              </summary>
              <pre style={{ 
                fontSize: '11px', 
                overflow: 'auto',
                marginTop: '10px',
                whiteSpace: 'pre-wrap'
              }}>
                {this.state.error?.message}
                {'\n\n'}
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with Firebase error boundary
 */
export function withFirebaseErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithFirebaseErrorBoundaryComponent(props: P) {
    return (
      <FirebaseErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </FirebaseErrorBoundary>
    );
  };
}