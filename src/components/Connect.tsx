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

  // Récupération de status et error que l'on renomme en wagmiError
  const {
    connect,
    connectors,
    status,
    error: wagmiError, // <-- Renommage
  } = useConnect();

  // Détermine si wagmi est en cours de connexion
  const isWagmiConnecting = status === 'pending';
  
  const [connectionState, setConnectionState] = React.useState<ConnectionState>(
    () => initialConnectionState
  );
  const [hasProcessedInitialConnection, setHasProcessedInitialConnection] =
    React.useState<boolean>(false);

  const retryTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const resetConnectionState = React.useCallback(() => {
    setConnectionState(initialConnectionState);
  }, []);

  const processConnection = React.useCallback(
    async (addr: string) => {
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

        if (sendEvent) {
          sendEvent(connectionData);
        }

        onUserConnected?.(addr);
        setHasProcessedInitialConnection(true);

        // Mise à jour de l'état
        setConnectionState((prev) => ({
          ...prev,
          isProcessing: false,
          error: null,
          retryCount: 0
        }));
      } catch (err) {
        console.error('Connection error:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Connection failed';

        setConnectionState((prev) => {
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
    },
    [
      telegramInitData,
      onUserConnected,
      sendEvent,
      connectionState.isProcessing
    ]
  );

  // Gérer la connexion initiale
  React.useEffect(() => {
    if (isConnected && address && !hasProcessedInitialConnection) {
      processConnection(address);
    }
  }, [isConnected, address, hasProcessedInitialConnection, processConnection]);

  // Nettoyage du setTimeout
  React.useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Reset quand telegramInitData change
  React.useEffect(() => {
    resetConnectionState();
    setHasProcessedInitialConnection(false);
  }, [telegramInitData, resetConnectionState]);

  const handleConnect = async () => {
    try {
      setConnectionState((prev) => ({ ...prev, isProcessing: true, error: null }));

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
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to connect wallet';

      setConnectionState({
        isProcessing: false,
        error: errorMessage,
        lastAttempt: Date.now(),
        retryCount: 0
      });

      Object.values(STORAGE_KEYS).forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('Failed to remove item from localStorage:', e);
        }
      });
    }
  };

  // Connexion directe à Phantom
  const handleConnectPhantom = React.useCallback(async () => {
    try {
      setConnectionState((prev) => ({
        ...prev,
        isProcessing: true,
        error: null
      }));

      const phantomConnector = connectors.find((c) => c.id === 'phantom');
      if (!phantomConnector) {
        throw new Error('Phantom connector is not available');
      }

      // Session si besoin
      if (!isSessionActive && typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEYS.SESSION,
          JSON.stringify({
            timestamp: Date.now(),
            lastConnect: new Date().toISOString(),
          })
        );
      }

      await connect({ connector: phantomConnector });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to connect Phantom';
      setConnectionState((prev) => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
        lastAttempt: Date.now(),
        retryCount: 0
      }));

      Object.values(STORAGE_KEYS).forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('Failed to remove item from localStorage:', e);
        }
      });
    }
  }, [connect, connectors, isSessionActive]);

  return (
    <div className="connect-container">
      <div className="connect-button-container">
        {/* Bouton principal (ouvre le modal RainbowKit) */}
        <ConnectButton.Custom>
          {() => (
            <button
              onClick={handleConnect}
              // Désactivé si déjà en train de connecter manuellement ou si wagmi est en connecting
              disabled={connectionState.isProcessing || isWagmiConnecting}
              className="connect-button"
            >
              {connectionState.isProcessing || isWagmiConnecting
                ? 'Connecting...'
                : `Connect ${platform === 'mobile' ? 'Mobile' : 'Desktop'} Wallet`}
            </button>
          )}
        </ConnectButton.Custom>

        {/* Bouton secondaire (connexion directe Phantom) */}
        <button
          onClick={handleConnectPhantom}
          disabled={connectionState.isProcessing || isWagmiConnecting}
          className="connect-button"
          style={{ marginLeft: '1rem' }} // juste pour espacer
        >
          {connectionState.isProcessing && isWagmiConnecting
            ? 'Connecting Phantom...'
            : 'Connect Phantom'}
        </button>
      </div>

      {/* Erreur interne */}
      {connectionState.error && (
        <div className="error-message">
          <div className="error-text">{connectionState.error}</div>
          <button
            onClick={() =>
              setConnectionState((prev) => ({ ...prev, error: null }))
            }
            className="error-dismiss"
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}

      {/* Erreur wagmi si vous souhaitez l'afficher */}
      {wagmiError && (
        <div className="error-message">
          <div className="error-text">
            Wagmi Error: {wagmiError?.message ?? 'Unknown error'}
          </div>
        </div>
      )}
    </div>
  );
}

export default Connect;
