import { useState, useEffect, Suspense, lazy } from 'react';
import { MessageSquare, X, Loader, Minimize2, Maximize2 } from 'lucide-react';

interface DisqusChatPanelProps {
  shortname: string;
  url?: string;
  identifier?: string;
  title?: string;
}

const DiscussionEmbed = lazy(() =>
  import('disqus-react').then(module => ({
    default: module.DiscussionEmbed
  }))
);

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '0px',
  right: '0px',
  width: '100%',
  maxWidth: '380px',
  zIndex: 9999,
  pointerEvents: 'none',
  margin: '0px !important',
  padding: '0px !important'
} as const;

const buttonStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  backgroundColor: '#1a1a1a',
  color: 'white',
  padding: '12px',
  borderRadius: '100%',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.2s ease',
  zIndex: 9999,
  pointerEvents: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px'
} as const;

const chatWindowStyle = (isOpen: boolean, isMinimized: boolean): React.CSSProperties => ({
  position: 'fixed',
  bottom: '0px',
  right: '24px',
  width: '380px',
  height: isMinimized ? '40px' : '580px', // Increased height
  backgroundColor: 'white',
  borderRadius: '16px 16px 0 0',
  boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
  opacity: isOpen ? 1 : 0,
  pointerEvents: 'auto'
} as const);

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  backgroundColor: '#1a1a1a',
  color: 'white',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  height: '40px'
} as const;

const headerButtonStyle = (isHovered: boolean): React.CSSProperties => ({
  background: isHovered ? 'rgba(255,255,255,0.1)' : 'transparent',
  border: 'none',
  color: 'white',
  padding: '6px',
  cursor: 'pointer',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  width: '28px',
  height: '28px'
});

const DisqusChatPanel: React.FC<DisqusChatPanelProps> = ({ 
  shortname,
  url = window.location.href,
  identifier = window.location.pathname,
  title = document.title
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [isDisqusConnected, setIsDisqusConnected] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    const checkConnection = () => {
      const observer = new MutationObserver(() => {
        const frame = document.getElementById('disqus_thread');
        if (frame) {
          const loginSection = frame.querySelector('#disqus_login');
          setIsDisqusConnected(!loginSection);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return observer;
    };

    const observer = checkConnection();
    return () => observer.disconnect();
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mobileStyles = isMobile ? {
    containerStyle: {
      maxWidth: '100%',
      bottom: 0,
      right: 0,
    },
    chatWindowStyle: {
      width: '100%',
      maxWidth: '600px',
      right: 0,
      margin: '0 auto',
      height: '80vh',
    }
  } : {};

  const disqusConfig = {
    url,
    identifier,
    title,
    language: 'en' // Changed to English
  };

  const disqusCustomStyle = `
    #disqus_thread {
      height: calc(100% - 20px) !important;
      padding: 16px !important;
      font-size: 13px !important;
      margin-bottom: 20px !important;
    }
    .dq-powered {
      display: none !important;
    }
    .dq-message, .dq-comment {
      font-size: 13px !important;
      line-height: 1.4 !important;
    }
    .dq-avatar img {
      width: 32px !important;
      height: 32px !important;
    }
    #placement-bottom {
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }
    iframe[src*="disqus.com"] {
      min-height: 0 !important;
    }
    @media (max-width: 768px) {
      #disqus_thread {
        height: calc(100% - 40px) !important;
      }
    }
  `;

  return (
    <div style={{ ...containerStyle, ...mobileStyles.containerStyle }}>
      {isOpen ? (
        <div style={{ ...chatWindowStyle(isOpen, isMinimized), ...mobileStyles.chatWindowStyle }}>
          <div style={headerStyle}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '13px', 
              fontWeight: 600, 
              letterSpacing: '0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ 
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isDisqusConnected ? '#22c55e' : '#ef4444',
                transition: 'background-color 0.3s ease'
              }}/>
              Ocean
            </h2>
            <div style={{ display: 'flex', gap: '4px' }}>
              {!isMobile && (
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  onMouseEnter={() => setHoveredButton('minimize')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={headerButtonStyle(hoveredButton === 'minimize')}
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? 
                    <Maximize2 size={16} /> : 
                    <Minimize2 size={16} />
                  }
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => setHoveredButton('close')}
                onMouseLeave={() => setHoveredButton(null)}
                style={headerButtonStyle(hoveredButton === 'close')}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div style={{ 
              flex: 1, 
              overflow: 'hidden', 
              backgroundColor: 'white', 
              height: 'calc(100% - 40px)',
              position: 'relative'
            }}>
              <style>{disqusCustomStyle}</style>
              <Suspense fallback={
                <div style={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: '#f8fafc' 
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <Loader className="animate-spin" size={20} style={{ marginBottom: '8px', color: '#94a3b8' }} />
                    <p style={{ color: '#64748b', fontSize: '13px' }}>⏳ Loading comments...</p>
                  </div>
                </div>
              }>
                <div style={{ 
                  height: '100%', 
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#CBD5E1 transparent',
                  paddingBottom: '20px'
                }}>
                  <DiscussionEmbed
                    shortname={shortname}
                    config={disqusConfig}
                  />
                </div>
              </Suspense>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setHoveredButton('chat')}
          onMouseLeave={() => setHoveredButton(null)}
          style={{
            ...buttonStyle,
            transform: hoveredButton === 'chat' ? 'translateY(-2px)' : 'none',
            boxShadow: hoveredButton === 'chat' 
              ? '0 6px 16px rgba(0, 0, 0, 0.2)' 
              : '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          title="Open chat"
        >
          <MessageSquare size={20} />
        </button>
      )}
    </div>
  );
};

export default DisqusChatPanel;