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
      // Sauvegarder les données de connexion
      localStorage.setItem(STORAGE_KEYS.LAST_CONNECT, new Date().toISOString());
      
      // Si l'objet Telegram.WebApp existe
      if ((window as any).Telegram?.WebApp) {
        try {
          // Créer un objet de données simple que le bot peut facilement parser
          const dataToSend = JSON.stringify({
            type: 'connect_wallet',
            address: address
          });
          
          // Envoyer les données au bot via WebApp.sendData()
          (window as any).Telegram.WebApp.sendData(dataToSend);
          
          console.log('Data sent to Telegram:', dataToSend);
        } catch (err) {
          console.error('Error sending data to Telegram:', err);
          setError('Failed to notify Telegram');
        }
      }
      
      // Appeler le callback si fourni
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
      setError(err?.message || 'Failed to connect wallet');
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
                ? 'Connecting...'
                : `Connect ${platform === 'mobile' ? 'Mobile' : 'Desktop'} Wallet`}
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
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default Connect;