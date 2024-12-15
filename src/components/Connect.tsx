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

  if (platform === 'mobile') {
    return (
      <div className="space-y-4">
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
                        className="w-full px-4 py-3 font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Connect Mobile Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="w-full px-4 py-3 font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Switch Network
                      </button>
                    );
                  }

                  return (
                    <div className="flex justify-between items-center gap-3">
                      <button
                        onClick={openChainModal}
                        className="flex items-center gap-2 px-4 py-2 font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                      >
                        {chain.hasIcon && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="w-5 h-5"
                          />
                        )}
                        {chain.name}
                      </button>

                      <button
                        onClick={openAccountModal}
                        className="flex items-center gap-2 px-4 py-2 font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
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

        {error && (
          <div 
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm relative"
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
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-md mx-auto space-y-4">
        <button
          onClick={handleDesktopConnect}
          disabled={isConnected || isConnecting}
          className="w-full px-4 py-3 font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Connect Desktop Wallet'}
        </button>

        {error && (
          <div 
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm relative"
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
  );
}