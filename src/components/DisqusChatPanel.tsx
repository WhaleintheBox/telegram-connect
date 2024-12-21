import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { MessageSquare, X, Loader } from 'lucide-react';

// Types
interface DisqusChatPanelProps {
  url?: string;
  identifier?: string;
  title?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Lazy load avec retry
const loadDiscussionEmbed = () => {
  return retry(() =>
    import('disqus-react').then(module => ({
      default: module.DiscussionEmbed
    }))
  );
};

const DiscussionEmbed = lazy(loadDiscussionEmbed);

// Fonction utilitaire de retry
function retry(fn: () => Promise<any>, retriesLeft = 3, interval = 1000): Promise<any> {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            reject(error);
            return;
          }
          retry(fn, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
}

// Error Boundary Component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Disqus Error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-600">
          <p>Unable to load comments. Please refresh the page.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <Loader className="animate-spin text-blue-500" size={24} />
  </div>
);

const DisqusChatPanel: React.FC<DisqusChatPanelProps> = ({
  url,
  identifier,
  title
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Configuration Disqus memoized
  const disqusConfig = React.useMemo(() => ({
    url: url || window.location.href,
    identifier: identifier || window.location.pathname,
    title: title || document.title,
    language: 'en',
    onReady: () => setIsLoaded(true)
  }), [url, identifier, title]);

  // Toggle handler with animation timing
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Scroll management
  useEffect(() => {
    let originalStyle: string;
    
    if (isOpen) {
      originalStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    return () => {
      if (originalStyle !== undefined) {
        document.body.style.overflow = originalStyle;
      }
    };
  }, [isOpen]);

  // Keyboard handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[48]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Panel */}
      <div className="fixed bottom-4 right-4 z-[49]">
        <div 
          className={`
            fixed bottom-20 right-4 
            w-96 h-[600px] max-h-[80vh]
            bg-white rounded-lg shadow-xl 
            transform transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
            <h3 className="font-semibold text-gray-700">
              Comments {isLoaded && <span className="text-sm text-green-500">•</span>}
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close comments"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Disqus Container */}
          <div className="h-[calc(100%-60px)] overflow-y-auto bg-gray-50">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                {isOpen && (
                  <div className="p-4">
                    <DiscussionEmbed
                      shortname="whaleinthebox"
                      config={disqusConfig}
                    />
                  </div>
                )}
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className={`
            p-3 rounded-full shadow-lg 
            flex items-center justify-center
            transition-all duration-200
            ${isOpen 
              ? 'bg-gray-700 hover:bg-gray-800 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
          `}
          aria-label="Toggle comments"
        >
          <MessageSquare size={24} />
        </button>
      </div>
    </>
  );
};

export default React.memo(DisqusChatPanel);