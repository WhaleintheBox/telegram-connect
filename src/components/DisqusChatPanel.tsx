import React, { useState, useEffect, Suspense, lazy } from 'react';
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

// Lazy load Disqus component
const DiscussionEmbed = lazy(() => import('disqus-react').then(module => ({
  default: module.DiscussionEmbed
})));

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

  // Configuration Disqus
  const disqusConfig = {
    url: url || window.location.href,
    identifier: identifier || window.location.pathname,
    title: title || document.title,
    language: 'en'
  };

  // Gestion du scroll quand le panel est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Gestionnaire d'événements pour fermer avec Escape
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
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Panel */}
      <div 
        className={`
          absolute bottom-16 right-0 
          w-80 md:w-96 h-[32rem] 
          bg-white rounded-lg shadow-xl 
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
          <h3 className="font-semibold text-gray-700">Comments</h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close comments"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Disqus Container */}
        <div className="p-4 h-[calc(100%-4rem)] overflow-y-auto bg-gray-50">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <DiscussionEmbed
                shortname="whaleinthebox"
                config={disqusConfig}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>


      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-3 rounded-full shadow-lg 
          flex items-center justify-center gap-2
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
  );
};

export default DisqusChatPanel;