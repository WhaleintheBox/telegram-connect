'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useConnect } from 'wagmi';
import { useConnectModal } from '../Context';
import { base } from '@reown/appkit/networks';

const STORAGE_KEYS = {
  CONNECTOR: 'witb-last-connector',
  SESSION: 'witb-session',
  TIMESTAMP: 'witb-connection-timestamp'
} as const;

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

export function Connect() {
  const { address, isConnected, connector: activeConnector } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { openConnectModal, platform } = useConnectModal();
  
  const [error, setError] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Vérification de la chaîne
  const isCorrectChain = chainId === base.id;

  // Gestion de la reconnexion automatique
  React.useEffect(() => {
    const attemptReconnection = async () => {
      const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);
      const lastConnector = localStorage.getItem(STORAGE_KEYS.CONNECTOR);

      if (!isConnected && sessionData && lastConnector) {
        try {
          const { timestamp } = JSON.parse(sessionData);
          if (Date.now() - timestamp < SESSION_DURATION) {
            const connector = connectors.find(c => c.id === lastConnector);
            if (connector) {
              setIsConnecting(true);
              await connect({ connector });
              updateSession();
            }
          } else {
            clearSession();
          }
        } catch (err) {
          console.error('Reconnection failed:', err);
          clearSession();
        } finally {
          setIsConnecting(false);
        }
      }
    };

    attemptReconnection();
  }, [isConnected, connect, connectors]);

  // Mise à jour de la session quand l'utilisateur est connecté
  React.useEffect(() => {
    if (isConnected && activeConnector && isCorrectChain) {
      updateSession(activeConnector.id);
    }
  }, [isConnected, activeConnector, isCorrectChain]);

  // Gestion de la visibilité de la page
  React.useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isConnected) {
        const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);
        if (sessionData) {
          try {
            const { timestamp } = JSON.parse(sessionData);
            if (Date.now() - timestamp > SESSION_DURATION) {
              clearSession();
            }
          } catch (err) {
            clearSession();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isConnected]);

  const updateSession = (connectorId?: string) => {
    const sessionData = {
      timestamp: Date.now(),
      lastConnectionTime: new Date().toISOString(),
      chainId: chainId
    };

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    
    if (connectorId) {
      localStorage.setItem(STORAGE_KEYS.CONNECTOR, connectorId);
    }
  };

  const clearSession = () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  };

  const handleConnect = async (openModalFn: () => void) => {
    try {
      setIsConnecting(true);
      setError(null);
      
      if (platform === 'mobile') {
        openModalFn();
      } else {
        await openConnectModal();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet');
      clearSession();
    } finally {
      setIsConnecting(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto pt-16 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-12">
          <img 
            src="/logo-witb.png" 
            alt="Whale in the Box"
            className="h-20 w-auto"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <ConnectButton.Custom>
            {({
              account,
              chain: connectedChain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && address;

              if (!ready) return null;
              
              if (!connected) {
                return (
                  <button
                    onClick={() => handleConnect(openConnectModal)}
                    disabled={isConnecting}
                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? 'Connecting...' : `Connect ${platform === 'mobile' ? 'Mobile' : 'Desktop'} Wallet`}
                  </button>
                );
              }

              if (!isCorrectChain) {
                return (
                  <button
                    onClick={openChainModal}
                    className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Switch to Base Network
                  </button>
                );
              }

              return (
                <div className="flex gap-4">
                  <button
                    onClick={openChainModal}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
                  >
                    {connectedChain?.hasIcon && (
                      <img
                        alt={connectedChain.name ?? 'Chain icon'}
                        src={connectedChain.iconUrl}
                        className="w-6 h-6"
                      />
                    )}
                    {connectedChain?.name}
                  </button>
                  <button
                    onClick={openAccountModal}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
                  >
                    <span className="truncate">
                      {account.displayName}
                      {account.displayBalance ? ` (${account.displayBalance})` : ''}
                    </span>
                  </button>
                </div>
              );
            }}
          </ConnectButton.Custom>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl relative">
              <div className="text-red-700 text-sm">{error}</div>
              <button
                onClick={clearError}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}