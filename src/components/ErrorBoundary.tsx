import { Component, ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(err: any) {
        console.error('UI ErrorBoundary caught:', err);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? (
                <div className="p-4 text-red-600">Something went wrong. Check console.</div>
            );
        }
        return this.props.children;
    }
}
