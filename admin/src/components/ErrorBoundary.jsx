import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('Admin ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-secondary-bg px-6">
                    <div className="text-center max-w-md bg-white p-12 rounded-lg shadow-heritage">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                            <span className="text-3xl font-bold text-red-500">!</span>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-heritage-charcoal mb-3">Something went wrong</h2>
                        <p className="text-gray-500 text-sm mb-8">
                            {this.props.fallbackMessage || 'An unexpected error occurred in the admin panel.'}
                        </p>
                        <button
                            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                            className="px-8 py-3 bg-heritage-charcoal text-white text-sm uppercase tracking-widest hover:bg-heritage-brown transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;