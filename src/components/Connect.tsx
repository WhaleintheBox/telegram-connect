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
  telegramInitData?: string;
  uid?: string;                 // Re-ajouté car utilisé dans App.tsx
  callbackEndpoint?: string;    // Re-ajouté car utilisé dans App.tsx
  sendEvent?: (event: any) => void;
}



interface ConnectionState {
  isProcessing: boolean;
  error: string | null;
  lastAttempt: number | null;
  retryCount: number;
}

const initialConnectionState: ConnectionState = {
  isProcessing: false,
  error: null,
  lastAttempt: null,
  retryCount: 0
};

export function Connect({ 
  onUserConnected, 
  telegramInitData, 
  sendEvent 
}: ConnectProps) {
  const { isConnected, address } = useAccount();
  const { openConnectModal, platform, isSessionActive } = useConnectModal();
  const [connectionState, setConnectionState] = React.useState<ConnectionState>(() => ({
    isProcessing: false,
    error: null,
    lastAttempt: null,
    retryCount: 0
  }));
  const [hasProcessedInitialConnection, setHasProcessedInitialConnection] = React.useState<boolean>(false);
  const retryTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const resetConnectionState = React.useCallback(() => {
    setConnectionState(initialConnectionState);
  }, []);

  const processConnection = React.useCallback(async (addr: string) => {
    if (!addr || connectionState.isProcessing) return;
  
    try {
      const connectionData = {
        type: 'connect_wallet',  // Changer 'event' en 'type' pour matcher le bot
        address: addr,
        initData: telegramInitData  // Renommer data en initData pour matcher le bot
      };
  
      console.log('Sending connection data:', connectionData);
  
      // Envoyer via Telegram WebApp
      if ((window as any).Telegram?.WebApp) {
        console.log('Sending via Telegram WebApp:', connectionData);
        try {
          (window as any).Telegram.WebApp.sendData(JSON.stringify(connectionData));
          console.log('Data sent to Telegram WebApp successfully');
          
          // Ne fermer qu'après confirmation
          setTimeout(() => {
            (window as any).Telegram.WebApp?.close();
          }, 3000);
        } catch (err) {
          console.error('Error sending to Telegram WebApp:', err);
          throw err;
        }
      }
  
      // On n'a plus besoin d'appeler l'endpoint /wallet-connect car le bot reçoit les données via WebApp
      
      if (sendEvent) {
        sendEvent(connectionData);
      }
  
      onUserConnected?.(addr);
      setHasProcessedInitialConnection(true);
  
      // Mettre à jour les états
      setConnectionState(prev => ({
        ...prev,
        isProcessing: false,
        error: null,
        retryCount: 0
      }));
  
    } catch (err) {
      console.error('Connection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      
      setConnectionState(prev => {
        const newRetryCount = prev.retryCount + 1;
        if (newRetryCount < 3) {
          retryTimeoutRef.current = setTimeout(() => {
            processConnection(addr);
          }, Math.min(1000 * Math.pow(2, newRetryCount), 5000));
        }
  
        return {
          isProcessing: false,
          error: errorMessage,
          lastAttempt: Date.now(),
          retryCount: newRetryCount
        };
      });
    }
  }, [telegramInitData, onUserConnected, sendEvent, connectionState.isProcessing]);

  // Handle initial and new connections
  React.useEffect(() => {
    if (isConnected && address && !hasProcessedInitialConnection) {
      processConnection(address);
    }
  }, [isConnected, address, hasProcessedInitialConnection, processConnection]);

  // Clean up retry timeout
  React.useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Reset connection state when telegramInitData changes
  React.useEffect(() => {
    resetConnectionState();
    setHasProcessedInitialConnection(false);
  }, [telegramInitData, resetConnectionState]);

  const handleConnect = async () => {
    try {
      setConnectionState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Update session data
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      
      setConnectionState({
        isProcessing: false,
        error: errorMessage,
        lastAttempt: Date.now(),
        retryCount: 0
      });

      Object.values(STORAGE_KEYS).forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('Failed to remove item from localStorage:', e);
        }
      });
    }
  };

  return (
    <div className="connect-container">
      <div className="connect-button-container">
        <ConnectButton.Custom>
          {() => (
            <button
              onClick={handleConnect}
              disabled={connectionState.isProcessing}
              className="connect-button"
            >
              {connectionState.isProcessing
                ? 'Connecting...'
                : `Connect ${platform === 'mobile' ? 'Mobile' : 'Desktop'} Wallet`}
            </button>
          )}
        </ConnectButton.Custom>
      </div>
      {connectionState.error && (
        <div className="error-message">
          <div className="error-text">{connectionState.error}</div>
          <button
            onClick={() => setConnectionState(prev => ({ ...prev, error: null }))}
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