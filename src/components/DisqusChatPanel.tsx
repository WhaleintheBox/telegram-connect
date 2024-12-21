import React, { useState, useEffect, Suspense, lazy } from 'react';
import { MessageSquare, X, Loader } from 'lucide-react';

interface DisqusChatPanelProps {
  url?: string;
  identifier?: string;
  title?: string;
}

const DiscussionEmbed = lazy(() =>
  import('disqus-react').then(module => ({
    default: module.DiscussionEmbed
  }))
);

const DisqusChatPanel: React.FC<DisqusChatPanelProps> = ({
  url,
  identifier,
  title
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  const disqusConfig = {
    url: url || window.location.href,
    identifier: identifier || window.location.pathname,
    title: title || document.title,
    language: 'en',
    onReady: () => setIsLoaded(true)
  };

  return (
    <div className="fixed z-[9999]" style={{ top: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
      <div className="relative h-full">
        {/* Chat Window */}
        {isOpen && (
          <div 
            className={`
              absolute bg-white shadow-2xl pointer-events-auto
              ${isMobile 
                ? 'fixed inset-x-0 top-[10vh] bottom-0 rounded-t-xl'
                : 'right-6 bottom-12 w-[380px] h-[520px] rounded-xl'
              }
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-gray-800 text-white rounded-t-xl">
              <div className="flex items-center gap-2">
                <span>{isLoaded ? '🟢' : '🔴'}</span>
                <span className="font-medium text-sm">Community Chat</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Content */}
            <div className="h-[calc(100%-48px)] bg-white overflow-hidden">
              <Suspense fallback={
                <div className="h-full flex items-center justify-center">
                  <Loader className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              }>
                <div className="h-full overflow-y-auto">
                  <DiscussionEmbed
                    shortname="whaleinthebox"
                    config={disqusConfig}
                  />
                </div>
              </Suspense>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <div className="absolute bottom-0 right-6 pointer-events-auto">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              flex items-center gap-2
              px-4 py-2
              bg-gray-800 hover:bg-gray-700
              text-gray-100
              rounded-t-lg
              transition-all
              shadow-lg
              ${isOpen ? 'opacity-90' : 'opacity-100'}
            `}
          >
            <span>{isLoaded ? '🟢' : '🔴'}</span>
            <MessageSquare size={18} className="text-gray-300" />
            <span className="text-sm font-medium">Chat</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[-1] pointer-events-auto"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default DisqusChatPanel;