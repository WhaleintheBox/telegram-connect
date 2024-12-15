'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useConnectModal } from '../Context';

const STORAGE_KEYS = {
  SESSION: 'witb-session',
  LAST_CONNECT: 'witb-last-connect'
} as const;

export function Connect() {
  const { isConnected, address } = useAccount();
  const { platform, isSessionActive } = useConnectModal();
  const [error, setError] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Enregistrer le moment de la connexion 
  React.useEffect(() => {
    if (isConnected && address && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LAST_CONNECT, new Date().toISOString());
    }
  }, [isConnected, address]);

  const handleConnect = async (openModalFn: () => void) => {
    try {
      setIsConnecting(true);
      setError(null);
      
      if (!isSessionActive && typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({
          timestamp: Date.now(),
          lastConnect: new Date().toISOString()
        }));
      }
      
      openModalFn();
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet');
      if (typeof window !== 'undefined') {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      }
    } finally {
      setIsConnecting(false);
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
  
        {/* Connection Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
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
                    onClick={() => handleConnect(openConnectModal)}
                    disabled={isConnecting}
                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isConnecting
                      ? 'Connecting...'
                      : `Connect ${platform === 'mobile' ? 'Mobile' : 'Desktop'} Wallet`}
                  </button>
                );
              }
  
              if (chain.unsupported) {
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
                  {/* Chain Info */}
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
  
                  {/* Account Info */}
                  <button
                    onClick={openAccountModal}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
                  >
                    <span className="truncate">
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ''}
                    </span>
                  </button>
                </div>
              );
            }}
          </ConnectButton.Custom>
  
          {/* Error Message */}
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
