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
        <div className="flex flex-col items-center justify-center min-h-[200px] p-5 bg-gray-50 border border-gray-200 rounded-lg m-5">
          <h3 className="text-red-600 mb-2.5">
            🚨 Something went wrong
          </h3>
          <p className="text-gray-500 text-center mb-4">
            There was an error loading this content. This might be a temporary issue with Firebase.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-blue-500 text-white border-none px-5 py-2.5 rounded cursor-pointer hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 text-white border-none px-5 py-2.5 rounded cursor-pointer hover:bg-green-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-2.5 bg-gray-200 rounded w-full max-w-[500px]">
              <summary className="cursor-pointer font-bold">
                Debug Info (Development Only)
              </summary>
              <pre className="text-[11px] overflow-auto mt-2.5 whitespace-pre-wrap">
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