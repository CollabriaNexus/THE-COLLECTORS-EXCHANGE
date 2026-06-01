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
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 bg-heritage-cream">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-heritage-beige flex items-center justify-center">
                            <span className="text-4xl font-serif text-heritage-bronze">!</span>
                        </div>
                        <h2 className="text-2xl font-serif text-heritage-charcoal mb-3">Something went wrong</h2>
                        <p className="text-heritage-bronze/70 text-sm mb-8">
                            {this.props.fallbackMessage || 'An unexpected error occurred. Please try refreshing the page.'}
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