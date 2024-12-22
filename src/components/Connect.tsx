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

interface ConnectionEvent {
  event: 'wallet_connected';
  address: string;
  data?: string;
  timestamp: number;
  source: 'web' | 'telegram';
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

    setConnectionState(prev => ({
      ...prev,
      isProcessing: true,
      lastAttempt: Date.now()
    }));

    try {
      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
        throw new Error('Invalid address format');
      }

      const connectionData: ConnectionEvent = {
        event: 'wallet_connected',
        address: addr,
        data: telegramInitData || '',
        timestamp: Date.now(),
        source: telegramInitData ? 'telegram' : 'web'
      };

      console.log('Processing connection:', connectionData);

      // Send to Cloud Function
      const response = await fetch('https://witbbot-638008614172.us-central1.run.app/wallet-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(connectionData)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Server reported failure');
      }

      // Handle Telegram WebApp if available
      if (telegramInitData && (window as any).Telegram?.WebApp?.sendData) {
        try {
          (window as any).Telegram.WebApp.sendData(JSON.stringify(connectionData));
          console.log('Data sent to Telegram WebApp');
          
          // Schedule WebApp closure
          setTimeout(() => {
            if ((window as any).Telegram?.WebApp?.close) {
              (window as any).Telegram.WebApp.close();
            }
          }, 2000);
        } catch (err) {
          console.warn('Error sending data to Telegram WebApp:', err);
          // Don't throw here as the main connection was successful
        }
      }

      // Update local storage and state
      localStorage.setItem(STORAGE_KEYS.LAST_CONNECT, new Date().toISOString());
      if (sendEvent) {
        sendEvent(connectionData);
      }
      onUserConnected?.(addr);

      setConnectionState(prev => ({
        ...prev,
        isProcessing: false,
        error: null,
        retryCount: 0
      }));
      setHasProcessedInitialConnection(true);

    } catch (err) {
      console.error('Connection error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      
      setConnectionState(prev => {
        const newRetryCount = prev.retryCount + 1;
        
        if (newRetryCount < 3) {
          // Schedule retry
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