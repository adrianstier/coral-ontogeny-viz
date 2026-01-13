/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      errorInfo: errorInfo.componentStack || null,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="glass-card max-w-2xl w-full p-8 text-center space-y-6">
            <div className="text-6xl">⚠️</div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-red-400">
                Something Went Wrong
              </h2>
              <p className="text-gray-300">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>

            {this.state.errorInfo && (
              <details className="text-left glass-panel p-4 rounded-lg">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                  View Error Details
                </summary>
                <pre className="mt-4 text-xs text-gray-500 overflow-auto max-h-64">
                  {this.state.errorInfo}
                </pre>
              </details>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="btn-primary"
              >
                Reload Application
              </button>
              <button
                onClick={() => window.history.back()}
                className="btn-secondary"
              >
                Go Back
              </button>
            </div>

            <p className="text-xs text-gray-500">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
