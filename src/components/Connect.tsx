'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useConnectModal } from '../Context';

const STORAGE_KEYS = {
  SESSION: 'witb-session',
  LAST_CONNECT: 'witb-last-connect'
} as const;

export function Connect() {
  const { isConnected, address } = useAccount();
  const { platform, isSessionActive } = useConnectModal();
  const [error, setError] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Enregistrer le moment de la connexion 
  React.useEffect(() => {
    if (isConnected && address && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LAST_CONNECT, new Date().toISOString());
    }
  }, [isConnected, address]);

  const handleConnect = async (openModalFn: () => void) => {
    try {
      setIsConnecting(true);
      setError(null);
      
      if (!isSessionActive && typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({
          timestamp: Date.now(),
          lastConnect: new Date().toISOString()
        }));
      }
      
      openModalFn();
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet');
      if (typeof window !== 'undefined') {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <div className="connect-container">
      <div className="connect-button-container">
        <ConnectButton.Custom>
          {({ openConnectModal }) => {
            const handleClick = () => handleConnect(openConnectModal);

            return (
              <button
                onClick={handleClick}
                disabled={isConnecting}
                className="connect-button"
              >
                {isConnecting
                  ? 'Connecting...'
                  : `Connect ${platform === 'mobile' ? 'Mobile' : 'Desktop'} Wallet`}
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
      {error && (
        <div className="error-message">
          <div className="error-text">{error}</div>
          <button
            onClick={clearError}
            className="error-dismiss"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}