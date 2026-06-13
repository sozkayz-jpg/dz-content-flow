import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  moduleName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.moduleName ? ` ${this.props.moduleName}` : ''}]`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Ce module a rencontré une erreur
            </h3>
            <p className="text-sm text-text-secondary max-w-md">
              {this.props.moduleName
                ? `Le module « ${this.props.moduleName} » a crashé.`
                : 'Une erreur inattendue est survenue.'}
            </p>
          </div>
          {this.state.error && (
            <pre className="text-xs text-red-400 bg-red-900/10 border border-red-900/20 rounded-lg p-3 max-w-md w-full overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <Button onClick={this.handleReset} variant="secondary">
            <RotateCcw className="w-4 h-4" />
            Réessayer
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
