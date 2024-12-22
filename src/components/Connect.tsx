'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

interface ConnectProps {
  onUserConnected?: (address: string) => void;
  telegramInitData?: string;
  uid?: string;
  callbackEndpoint?: string;
  sendEvent?: (data: any) => void;
}

export function Connect({ 
  onUserConnected, 
  telegramInitData,
  uid,
  callbackEndpoint,
  sendEvent 
}: ConnectProps) {
  const { isConnected, address } = useAccount();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Notification au bot
  React.useEffect(() => {
    if (isConnected && address) {
      onUserConnected?.(address);
      
      if (sendEvent && uid && callbackEndpoint) {
        const connectionData = {
          type: 'connect_wallet',
          address: address,
          connect: true,
          initData: telegramInitData // Added Telegram initData
        };
        
        sendEvent({ ...connectionData, uid });
      }
    }
  }, [isConnected, address, onUserConnected, sendEvent, uid, callbackEndpoint, telegramInitData]);

  return (
    <div className="connect-container p-4 max-w-md mx-auto">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              <div className="flex flex-col space-y-3">
                {/* RainbowKit Button */}
                <button
                  onClick={openConnectModal}
                  disabled={isConnecting}
                  className={`
                    w-full px-4 py-3 rounded-xl text-lg font-medium
                    flex items-center justify-center gap-2
                    transition-all duration-200
                    ${isConnecting 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'}
                  `}
                >
                  {isConnecting ? (
                    <>
                      <span className="animate-spin">⚡</span>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <span>🌈</span>
                      <span>Connect Wallet</span>
                    </>
                  )}
                </button>

                {/* MetaMask Button */}
                <button
                  onClick={() => {
                    setIsConnecting(true);
                    openConnectModal();
                  }}
                  disabled={isConnecting}
                  className={`
                    w-full px-4 py-3 rounded-xl text-lg font-medium
                    flex items-center justify-center gap-2
                    transition-all duration-200
                    ${isConnecting 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:opacity-90'}
                  `}
                >
                  <span>🦊</span>
                  <span>MetaMask</span>
                </button>

                {/* Phantom Button */}
                <button
                  onClick={() => {
                    setIsConnecting(true);
                    openConnectModal();
                  }}
                  disabled={isConnecting}
                  className={`
                    w-full px-4 py-3 rounded-xl text-lg font-medium
                    flex items-center justify-center gap-2
                    transition-all duration-200
                    ${isConnecting 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:opacity-90'}
                  `}
                >
                  <span>👻</span>
                  <span>Phantom</span>
                </button>

                {/* Injected Wallet Button */}
                <button
                  onClick={() => {
                    setIsConnecting(true);
                    openConnectModal();
                  }}
                  disabled={isConnecting}
                  className={`
                    w-full px-4 py-3 rounded-xl text-lg font-medium
                    flex items-center justify-center gap-2
                    transition-all duration-200
                    ${isConnecting 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90'}
                  `}
                >
                  <span>💼</span>
                  <span>Browser Wallet</span>
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {error}
                  <button 
                    onClick={() => setError(null)}
                    className="float-right text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {connected && (
                <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-600 text-sm">
                  Connected as {account.displayName}
                </div>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}

export default Connect;