'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
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
  const [platform, setPlatform] = React.useState<Platform>('desktop');
  const [error, setError] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);

  React.useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const handleDesktopConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await openConnectModal();
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const clearError = () => setError(null);

  const renderWalletButtons = () => {
    if (platform === 'mobile') {
      return (
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

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        className="w-full px-6 py-4 font-semibold text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
                      >
                        Connect Mobile Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="w-full px-6 py-4 font-semibold text-lg rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg"
                      >
                        Switch Network
                      </button>
                    );
                  }

                  return (
                    <div className="flex justify-between items-center gap-4">
                      <button
                        onClick={openChainModal}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
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
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                      >
                        {account.displayName}
                        {account.displayBalance ? ` (${account.displayBalance})` : ''}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      );
    }

    return (
      <button
        onClick={handleDesktopConnect}
        disabled={isConnected || isConnecting}
        className="w-full px-6 py-4 font-semibold text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
      >
        {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Connect Desktop Wallet'}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="w-full max-w-md px-6">
        {/* Logo centré */}
        <div className="flex justify-center mb-8">
          <img 
            src="/logo-witb.png" 
            alt="Whale in the Box"
            className="h-16 w-auto"
          />
        </div>

        {/* Container pour les boutons et messages d'erreur */}
        <div className="space-y-6">
          {/* Boutons de connexion */}
          <div className="space-y-4">
            {renderWalletButtons()}
          </div>

          {/* Message d'erreur */}
          {error && (
            <div 
              className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm relative shadow-sm"
              role="alert"
            >
              <button
                onClick={clearError}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                aria-label="Dismiss error"
              >
                ×
              </button>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}