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
  maxWidth: '360px',
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
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  zIndex: 9999,
  pointerEvents: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
} as const;

const chatWindowStyle = (isOpen: boolean, isMinimized: boolean): React.CSSProperties => ({
  position: 'fixed',
  bottom: '0px',
  right: '24px',
  width: '360px',
  height: isMinimized ? '48px' : '480px',
  backgroundColor: 'white',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
  opacity: isOpen ? 1 : 0,
  pointerEvents: 'auto'
} as const);

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  backgroundColor: '#1a1a1a',
  color: 'white',
  borderBottom: '1px solid rgba(255,255,255,0.1)'
} as const;

const headerButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'white',
  padding: '6px',
  cursor: 'pointer',
  borderRadius: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
} as const;

const DisqusChatPanel: React.FC<DisqusChatPanelProps> = ({ 
  shortname,
  url = window.location.href,
  identifier = window.location.pathname,
  title = document.title
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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

  return (
    <div style={containerStyle}>
      {isOpen ? (
        <div style={chatWindowStyle(isOpen, isMinimized)}>
          <div style={headerStyle}>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Community Chat</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                style={headerButtonStyle}
              >
                {isMinimized ? 
                  <Maximize2 size={18} /> : 
                  <Minimize2 size={18} />
                }
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={headerButtonStyle}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div style={{ flex: 1, overflow: 'hidden', backgroundColor: 'white', height: 'calc(100% - 48px)' }}>
              <Suspense fallback={
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Loader className="animate-spin" size={24} style={{ marginBottom: '8px', color: '#94a3b8' }} />
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Chargement des commentaires...</p>
                  </div>
                </div>
              }>
                <div style={{ height: '100%', overflow: 'auto' }}>
                  <DiscussionEmbed
                    shortname={shortname}
                    config={{
                      url,
                      identifier,
                      title,
                      language: 'fr'
                    }}
                  />
                </div>
              </Suspense>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={buttonStyle}
        >
          <MessageSquare size={20} />
        </button>
      )}
    </div>
  );
};

export default DisqusChatPanel;