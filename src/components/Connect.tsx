'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

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
  const { connectAsync, connectors } = useConnect();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { open } = useAppKit();

  // Détecte si on est sur mobile
  const isMobile = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /mobile|android|iphone|ipad|ipod/.test(
      window.navigator.userAgent.toLowerCase()
    );
  }, []);

  // Connecter avec MetaMask directement
  const connectMetaMask = async (openConnectModal: () => void) => {
    try {
      setIsConnecting(true);
      const connector = connectors.find(c => c.name === 'MetaMask');
      if (connector) {
        await connectAsync({ connector });
      } else {
        openConnectModal();
      }
    } catch (err) {
      console.error('MetaMask connection error:', err);
      openConnectModal();
    } finally {
      setIsConnecting(false);
    }
  };

  // Connecter avec Phantom directement
  const connectPhantom = async (openConnectModal: () => void) => {
    try {
      setIsConnecting(true);
      
      // Si sur mobile, rediriger vers l'app Phantom
      if (isMobile) {
        window.location.href = 'https://phantom.app/ul/browse/';
        return;
      }

      const connector = connectors.find(c => c.name === 'Phantom');
      if (connector) {
        await connectAsync({ connector });
      } else {
        openConnectModal();
      }
    } catch (err) {
      console.error('Phantom connection error:', err);
      openConnectModal();
    } finally {
      setIsConnecting(false);
    }
  };

  // Notification au bot
  React.useEffect(() => {
    if (isConnected && address) {
      onUserConnected?.(address);
      
      if (sendEvent && uid && callbackEndpoint) {
        const connectionData = {
          type: 'connect_wallet',
          address: address,
          connect: true,
          initData: telegramInitData
        };
        
        sendEvent({ ...connectionData, uid });
      }
    }
  }, [isConnected, address, onUserConnected, sendEvent, uid, callbackEndpoint, telegramInitData]);

  return (
    <div style={{
      padding: '16px',
      maxWidth: '420px',
      margin: '0 auto'
    }}>
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
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {/* RainbowKit Button */}
                <button
                  onClick={openConnectModal}
                  disabled={isConnecting}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: isConnecting 
                      ? '#f3f4f6'
                      : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: isConnecting ? '#9ca3af' : 'white',
                    border: 'none',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                >
                  {isConnecting ? (
                    <>
                      <span style={{ animation: 'spin 1s linear infinite' }}>⚡</span>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <span>🌈</span>
                      <span>RainbowKit</span>
                    </>
                  )}
                </button>

                {/* Reown Button */}
                <button
                  onClick={() => {
                    setIsConnecting(true);
                    open({ view: 'Connect' });
                  }}
                  disabled={isConnecting}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: isConnecting 
                      ? '#f3f4f6'
                      : 'linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)',
                    color: isConnecting ? '#9ca3af' : 'white',
                    border: 'none',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                >
                  <span>✨</span>
                  <span>ReownKit</span>
                </button>

                {/* MetaMask Button */}
                <button
                  onClick={() => connectMetaMask(openConnectModal)}
                  disabled={isConnecting}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: isConnecting 
                      ? '#f3f4f6'
                      : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    color: isConnecting ? '#9ca3af' : 'white',
                    border: 'none',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                >
                  <span>🦊</span>
                  <span>MetaMask</span>
                </button>

                {/* Phantom Button */}
                <button
                  onClick={() => connectPhantom(openConnectModal)}
                  disabled={isConnecting}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: isConnecting 
                      ? '#f3f4f6'
                      : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: isConnecting ? '#9ca3af' : 'white',
                    border: 'none',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                >
                  <span>👻</span>
                  <span>Phantom</span>
                </button>
              </div>

              {error && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '14px'
                }}>
                  {error}
                  <button 
                    onClick={() => setError(null)}
                    style={{
                      float: 'right',
                      border: 'none',
                      background: 'none',
                      color: '#dc2626',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              
              {connected && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  fontSize: '14px'
                }}>
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