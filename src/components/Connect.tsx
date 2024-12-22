'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect } from 'wagmi';
import { useConnectModal } from '../Context';

const STORAGE_KEYS = {
  SESSION: 'witb-session',
  LAST_CONNECT: 'witb-last-connect',
} as const;

interface ConnectProps {
  onUserConnected?: (address: string) => void;
  telegramInitData?: string;
  uid?: string;
  callbackEndpoint?: string;
  sendEvent?: (data: any) => void;
}

interface ConnectionState {
  isProcessing: boolean;
  error: string | null;
  activeConnector: string | null;
}

const initialConnectionState: ConnectionState = {
  isProcessing: false,
  error: null,
  activeConnector: null
};

export function Connect({ 
  onUserConnected, 
  uid,
  callbackEndpoint,
  sendEvent 
}: ConnectProps) {
  const { isConnected, address } = useAccount();
  const { openConnectModal, platform, isSessionActive } = useConnectModal();
  const {
    connect,
    connectors,
    status,
    error: wagmiError,
  } = useConnect();

  const isWagmiConnecting = status === 'pending';
  const [connectionState, setConnectionState] = React.useState<ConnectionState>(initialConnectionState);

  // Monitor connection and notify bot
  React.useEffect(() => {
    const notifyConnection = async () => {
      if (isConnected && address) {
        onUserConnected?.(address);
        
        // Notify bot if we have all required data
        if (sendEvent && uid && callbackEndpoint) {
          const connectionData = {
            type: 'connect_wallet',
            address: address,
            connect: true
          };
          
          sendEvent({ ...connectionData, uid });
        }
        
        setConnectionState(initialConnectionState);
      }
    };

    notifyConnection();
  }, [isConnected, address, onUserConnected, sendEvent, uid, callbackEndpoint]);

  const updateSessionData = () => {
    if (!isSessionActive && typeof window !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEYS.SESSION,
        JSON.stringify({
          timestamp: Date.now(),
          lastConnect: new Date().toISOString(),
        })
      );
    }
  };

  const clearSessionData = () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('Failed to remove item from localStorage:', e);
      }
    });
  };

  // Rainbow Kit Modal handler
  const handleRainbowConnect = async () => {
    try {
      setConnectionState({ ...initialConnectionState, isProcessing: true, activeConnector: 'rainbow' });
      updateSessionData();
      await openConnectModal();
    } catch (err) {
      setConnectionState({
        isProcessing: false,
        error: err instanceof Error ? err.message : 'Failed to connect wallet',
        activeConnector: null
      });
      clearSessionData();
    }
  };

  // Direct connector handlers
  const handleDirectConnect = React.useCallback(async (connectorId: string) => {
    try {
      setConnectionState({ ...initialConnectionState, isProcessing: true, activeConnector: connectorId });
      
      const selectedConnector = connectors.find((c) => c.id === connectorId);
      if (!selectedConnector) {
        throw new Error(`${connectorId} connector is not available`);
      }

      updateSessionData();
      await connect({ connector: selectedConnector });
    } catch (err) {
      setConnectionState({
        isProcessing: false,
        error: err instanceof Error ? err.message : `Failed to connect ${connectorId}`,
        activeConnector: null
      });
      clearSessionData();
    }
  }, [connect, connectors]);

  const getConnectorButton = (
    connectorId: string, 
    icon: string, 
    label: string
  ) => (
    <button
      onClick={() => handleDirectConnect(connectorId)}
      disabled={connectionState.isProcessing || isWagmiConnecting}
      className={`connect-button flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl transition-all duration-200 ${
        connectionState.activeConnector === connectorId
          ? 'bg-purple-600 text-white'
          : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">
        {connectionState.isProcessing && connectionState.activeConnector === connectorId
          ? 'Connecting...'
          : label}
      </span>
    </button>
  );

  return (
    <div className="connect-container p-4 max-w-md mx-auto">
      <div className="space-y-3">
        {/* Rainbow Kit Modal Button */}
        <ConnectButton.Custom>
          {() => (
            <button
              onClick={handleRainbowConnect}
              disabled={connectionState.isProcessing || isWagmiConnecting}
              className={`connect-button flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl transition-all duration-200 ${
                connectionState.activeConnector === 'rainbow'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
              }`}
            >
              <span className="text-xl">🌈</span>
              <span className="font-medium">
                {connectionState.isProcessing && connectionState.activeConnector === 'rainbow'
                  ? 'Connecting...'
                  : `Connect with Rainbow Kit${platform === 'mobile' ? ' (Mobile)' : ''}`}
              </span>
            </button>
          )}
        </ConnectButton.Custom>

        {/* Direct Connection Buttons */}
        <div className="grid grid-cols-1 gap-3">
          {getConnectorButton('rainbow', '🌈', 'Connect Rainbow')}
          {getConnectorButton('metaMask', '🦊', 'Connect MetaMask')}
          {getConnectorButton('phantom', '👻', 'Connect Phantom')}
        </div>
      </div>

      {/* Error Messages */}
      {connectionState.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="text-red-700">{connectionState.error}</div>
            <button
              onClick={() => setConnectionState(prev => ({ ...prev, error: null }))}
              className="text-red-500 hover:text-red-700"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {wagmiError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="text-red-700">
            Connection Error: {wagmiError?.message ?? 'Unknown error'}
          </div>
        </div>
      )}
    </div>
  );
}

export default Connect;