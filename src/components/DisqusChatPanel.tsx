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
  const [isLoading, setIsLoading] = useState(true);

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
    onReady: () => setIsLoading(false)
  };

  return (
    <>
      {/* Chat Container - Fixed to viewport */}
      <div className="fixed bottom-0 right-0 z-[9999] flex flex-col items-end">
        {/* Chat Window */}
        <div className={`
          bg-white shadow-xl transition-all duration-300 ease-out transform
          ${isMobile 
            ? 'fixed inset-x-0 bottom-0 rounded-t-xl'
            : 'w-[380px] h-[520px] mb-14 mr-6 rounded-xl'
          }
          ${isOpen 
            ? `${isMobile ? 'h-[90vh]' : ''} translate-y-0 opacity-100`
            : 'translate-y-full opacity-0 pointer-events-none'
          }
        `}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#3b82f6] text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400' : 'bg-green-400'} transition-colors`}></div>
              <h3 className="font-semibold">Community Chat</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-blue-600/50 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="h-[calc(100%-48px)] bg-gray-50">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading chat...</p>
                </div>
              </div>
            }>
              <div className="h-full overflow-y-auto custom-scrollbar">
                <DiscussionEmbed
                  shortname="whaleinthebox"
                  config={disqusConfig}
                />
              </div>
            </Suspense>
          </div>
        </div>

        {/* Chat Bar - Always visible */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            fixed bottom-4 ${isMobile ? 'right-4' : 'right-6'}
            flex items-center gap-2
            px-4 py-2.5
            bg-[#3b82f6] hover:bg-[#2563eb]
            text-white font-medium
            rounded-full shadow-lg
            transition-all duration-200
            ${isOpen ? 'opacity-90 hover:opacity-100' : ''}
          `}
        >
          <MessageSquare size={20} className="text-white" />
          <span className="text-sm">Community Chat</span>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default DisqusChatPanel;