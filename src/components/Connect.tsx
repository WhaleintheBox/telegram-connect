'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect } from 'wagmi';
import { useConnectModal } from '../Context';

type Platform = 'mobile' | 'desktop';

const detectPlatform = (): Platform => {
  if (typeof window === 'undefined') return 'desktop';
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /mobile|android|iphone|ipad|ipod/.test(userAgent) ? 'mobile' : 'desktop';
};

export function Connect() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { connect, connectors } = useConnect();
  const [platform, setPlatform] = React.useState<Platform>('desktop');
  const [error, setError] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);

  React.useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // Gestion de la reconnexion automatique
  React.useEffect(() => {
    if (!isConnected && typeof window !== 'undefined') {
      const lastConnector = localStorage.getItem('witb-last-connector');
      const lastTimestamp = localStorage.getItem('witb-connection-timestamp');
      
      if (lastConnector && lastTimestamp) {
        // Vérifier si la connexion n'a pas expiré (24h)
        const timestamp = parseInt(lastTimestamp);
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          const connector = connectors.find(c => c.id === lastConnector);
          if (connector) {
            connect({ connector });
          }
        } else {
          // Nettoyer les données expirées
          localStorage.removeItem('witb-last-connector');
          localStorage.removeItem('witb-connection-timestamp');
        }
      }
    }
  }, [isConnected, connect, connectors]);

  const handleDesktopConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await openConnectModal();
      // Sauvegarder le timestamp de connexion
      localStorage.setItem('witb-connection-timestamp', Date.now().toString());
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet');
      // Nettoyer en cas d'erreur
      localStorage.removeItem('witb-last-connector');
      localStorage.removeItem('witb-connection-timestamp');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMobileConnect = async (openModalFn: () => void, connectorId?: string) => {
    try {
      if (connectorId) {
        localStorage.setItem('witb-last-connector', connectorId);
        localStorage.setItem('witb-connection-timestamp', Date.now().toString());
      }
      openModalFn();
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet');
      localStorage.removeItem('witb-last-connector');
      localStorage.removeItem('witb-connection-timestamp');
    }
  };

  const clearError = () => setError(null);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto pt-16 px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <img 
            src="/logo-witb.png" 
            alt="Whale in the Box"
            className="h-20 w-auto"
          />
        </div>

        {/* Connect Button Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {platform === 'mobile' ? (
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                if (!ready) return null;
                
                if (!connected) {
                  return (
                    <button
                      onClick={() => handleMobileConnect(openConnectModal)}
                      className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Connect Mobile Wallet
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Switch Network
                    </button>
                  );
                }

                return (
                  <div className="flex gap-4">
                    <button
                      onClick={openChainModal}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
                    >
                      {chain.hasIcon && (
                        <img
                          alt={chain.name ?? 'Chain icon'}
                          src={chain.iconUrl}
                          className="w-6 h-6"
                        />
                      )}
                      {chain.name}
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
          ) : (
            <button
              onClick={handleDesktopConnect}
              disabled={isConnected || isConnecting}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Connect Desktop Wallet'}
            </button>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl relative">
              <div className="text-red-700 text-sm">
                {error}
              </div>
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