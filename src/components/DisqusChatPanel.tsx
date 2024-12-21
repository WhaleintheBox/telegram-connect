import React, { useState, Suspense, lazy } from 'react';
import { MessageSquare, X, Loader } from 'lucide-react';

// Types
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

  const disqusConfig = {
    url: url || window.location.href,
    identifier: identifier || window.location.pathname,
    title: title || document.title,
    language: 'en'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      <div 
        className={`
          absolute bottom-16 right-0
          w-[380px] h-[580px]
          bg-white rounded-xl shadow-2xl
          transform transition-all duration-200 ease-in-out
          ${isOpen 
            ? 'translate-y-0 opacity-100 pointer-events-auto' 
            : 'translate-y-4 opacity-0 pointer-events-none'
          }
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white rounded-t-xl">
          <h3 className="text-base font-semibold text-gray-800">Comments</h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto bg-gray-50">
            <Suspense 
              fallback={
                <div className="h-full flex items-center justify-center">
                  <Loader className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              }
            >
              <div className="p-4">
                <DiscussionEmbed
                  shortname="whaleinthebox"
                  config={disqusConfig}
                />
              </div>
            </Suspense>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-3.5 rounded-full shadow-lg
          flex items-center justify-center
          transition-colors duration-200
          ${isOpen 
            ? 'bg-gray-700 hover:bg-gray-800' 
            : 'bg-blue-500 hover:bg-blue-600'
          }
          text-white
        `}
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
};

export default DisqusChatPanel;