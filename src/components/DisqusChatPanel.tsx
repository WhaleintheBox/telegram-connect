import { useState, useEffect, Suspense, lazy, FC } from 'react';
import { MessageSquare, X, Loader } from 'lucide-react';

interface DisqusChatPanelProps {
  url?: string;
  identifier?: string;
  title?: string;
}

interface DisqusConfig {
  url: string;
  identifier: string;
  title: string;
  onReady: () => void;
}

// Lazy load Disqus
const DiscussionEmbed = lazy(() =>
  import('disqus-react').then(module => ({
    default: module.DiscussionEmbed
  }))
);

const DisqusChatPanel: FC<DisqusChatPanelProps> = ({
  url,
  identifier,
  title
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle body scroll lock for mobile
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

  const disqusConfig: DisqusConfig = {
    url: url || window.location.href,
    identifier: identifier || window.location.pathname,
    title: title || document.title,
    onReady: () => setIsLoaded(true)
  };

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      {/* Chat Window */}
      <div className={`
        fixed transition-all duration-300 ease-in-out
        ${isMobile 
          ? 'inset-0 bg-black/50'
          : 'bottom-16 right-6 w-96 h-[520px]'
        }
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        <div className={`
          bg-white shadow-xl
          ${isMobile 
            ? 'absolute inset-x-0 bottom-0 h-[90vh] rounded-t-xl' 
            : 'h-full rounded-xl'
          }
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gray-800 text-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <span>{isLoaded ? '🟢' : '🔴'}</span>
              <span className="font-medium">Community Chat</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Content */}
          <div className="h-[calc(100%-60px)] bg-gray-50">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center">
                <Loader className="w-6 h-6 animate-spin text-gray-400" />
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
      </div>

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 
          flex items-center gap-2
          px-4 py-2.5
          bg-gray-800 hover:bg-gray-700
          text-white
          rounded-lg
          shadow-lg
          transition-all
          transform hover:-translate-y-0.5
          pointer-events-auto
          z-50
        `}
      >
        <MessageSquare size={20} />
        <span className="font-medium">Chat</span>
      </button>
    </div>
  );
};

export default DisqusChatPanel;