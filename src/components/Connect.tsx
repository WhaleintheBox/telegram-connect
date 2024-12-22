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
  sendEvent?: (event: any) => void;
}

interface ConnectionEvent {
  type: 'connect_wallet';
  address: string;
  initData?: string;
  status?: 'success' | 'error';
  error?: string;
}

export function Connect({ onUserConnected, telegramInitData, sendEvent }: ConnectProps) {
  const { isConnected, address } = useAccount();
  const { openConnectModal, platform, isSessionActive } = useConnectModal();
  const [error, setError] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [connectionSent, setConnectionSent] = React.useState(false);

  const sendConnectionEvent = React.useCallback((event: ConnectionEvent) => {
    if (sendEvent) {
      sendEvent(event);
    }

    if (telegramInitData && (window as any).Telegram?.WebApp?.sendData) {
      try {
        (window as any).Telegram.WebApp.sendData(JSON.stringify(event));
        console.log('Connection event sent to Telegram:', event);
        
        // Only close if it's a successful connection
        if (event.status === 'success') {
          setTimeout(() => {
            (window as any).Telegram.WebApp.close();
          }, 2000);
        }
      } catch (err) {
        console.error('Error sending data to Telegram:', err);
        setError('Failed to communicate with Telegram');
      }
    }
  }, [sendEvent, telegramInitData]);

  const handleConnection = React.useCallback((addr: string) => {
    if (connectionSent) return;

    try {
      // Prepare connection event
      const connectionEvent: ConnectionEvent = {
        type: 'connect_wallet',
        address: addr,
        status: 'success'
      };

      // Add telegram data if present
      if (telegramInitData) {
        connectionEvent.initData = telegramInitData;
      }

      // Send the event
      sendConnectionEvent(connectionEvent);
      setConnectionSent(true);

      // Store connection timestamp
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.LAST_CONNECT, new Date().toISOString());
      }

      // Notify parent component
      onUserConnected?.(addr);

    } catch (err) {
      console.error('Error in handleConnection:', err);
      const errorEvent: ConnectionEvent = {
        type: 'connect_wallet',
        address: addr,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error during connection'
      };
      sendConnectionEvent(errorEvent);
      setError('Failed to process connection');
    }
  }, [connectionSent, telegramInitData, sendConnectionEvent, onUserConnected]);

  // Handle existing connection on mount
  React.useEffect(() => {
    if (isConnected && address && !connectionSent) {
      console.log("Handling existing connection:", { address });
      handleConnection(address);
    }
  }, [isConnected, address, handleConnection, connectionSent]);

  // Handle new connections
  React.useEffect(() => {
    if (isConnected && address && !connectionSent) {
      console.log("New connection detected:", { address });
      handleConnection(address);
    }
  }, [isConnected, address, handleConnection, connectionSent]);

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
      const errorMessage = err?.message || 'Failed to connect wallet';
      setError(errorMessage);
      
      const errorEvent: ConnectionEvent = {
        type: 'connect_wallet',
        address: '',
        status: 'error',
        error: errorMessage
      };
      sendConnectionEvent(errorEvent);

      if (typeof window !== 'undefined') {
        Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Reset connection status when telegramInitData changes
  React.useEffect(() => {
    setConnectionSent(false);
  }, [telegramInitData]);

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