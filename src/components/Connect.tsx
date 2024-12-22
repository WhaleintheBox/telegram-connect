'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useConnectModal } from '../Context';

const STORAGE_KEYS = {
  SESSION: 'witb-session',
  LAST_CONNECT: 'witb-last-connect',
} as const;

interface ConnectProps {
  onUserConnected?: (address: string) => void;
}

export function Connect({ onUserConnected }: ConnectProps) {
  const { isConnected, address } = useAccount();
  const { openConnectModal, platform, isSessionActive } = useConnectModal();
  const [error, setError] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);

  React.useEffect(() => {
    if (isConnected && address && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LAST_CONNECT, new Date().toISOString());
      onUserConnected?.(address);
    }
  }, [isConnected, address, onUserConnected]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (!isSessionActive && typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEYS.SESSION,
          JSON.stringify({
            timestamp: Date.now(),
            lastConnect: new Date().toISOString(),
          })
        );
      }

      await openConnectModal();
    } catch (err: any) {
      setError(err?.message || 'Échec de la connexion au wallet');
      if (typeof window !== 'undefined') {
        Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="connect-container">
      <div className="connect-button-container">
        <ConnectButton.Custom>
          {() => (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="connect-button"
            >
              {isConnecting
                ? 'Connexion...'
                : `Connecter ${platform === 'mobile' ? 'Mobile' : 'Desktop'} Wallet`}
            </button>
          )}
        </ConnectButton.Custom>
      </div>
      {error && (
        <div className="error-message">
          <div className="error-text">{error}</div>
          <button
            onClick={() => setError(null)}
            className="error-dismiss"
            aria-label="Fermer l'erreur"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}