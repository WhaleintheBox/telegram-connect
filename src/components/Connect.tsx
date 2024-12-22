'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: string }>;
      };
    };
    ethereum?: any;
  }
}

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
  const { address } = useAccount();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { open } = useAppKit();
  const [hasNotified, setHasNotified] = React.useState(false);

  const [dappKeyPair] = React.useState(nacl.box.keyPair());

  // Notification Telegram lors de la connexion
  React.useEffect(() => {
    const notifyConnection = async () => {
      if (address && uid && !hasNotified && (sendEvent || callbackEndpoint)) {
        try {
          const connectionData = {
            type: 'connect_wallet',
            address,
            connect: true,
            initData: telegramInitData
          };

          if (sendEvent) {
            sendEvent({ ...connectionData, uid });
          } else if (callbackEndpoint) {
            await fetch(callbackEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...connectionData, uid })
            });
          }
          setHasNotified(true);
        } catch (err) {
          console.error('Failed to notify Telegram:', err);
        }
      }
    };
    notifyConnection();
  }, [address, uid, callbackEndpoint, sendEvent, hasNotified, telegramInitData]);

  const connectPhantom = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        const params = new URLSearchParams({
          app_url: window.location.origin,
          dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
          redirect_link: window.location.origin,
          cluster: 'mainnet'
        });

        const url = `https://phantom.app/ul/v1/connect?${params.toString()}`;
        window.location.href = url;
      } else if (window.phantom?.solana) {
        try {
          const response = await window.phantom.solana.connect();
          onUserConnected?.(response.publicKey);
        } catch (err) {
          setError('Failed to connect to Phantom. Please try again.');
        }
      } else {
        window.open('https://phantom.app', '_blank');
      }

    } catch (err) {
      console.error('Phantom connection error:', err);
      setError('Failed to connect to Phantom');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectMetaMask = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Deep link vers MetaMask mobile
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://metamask.app.link/dapp/${currentUrl}`;
    } else {
      // Injection sur desktop
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_requestAccounts' });
      } else {
        window.open('https://metamask.io/download/', '_blank');
      }
    }
  };

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
            <div {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
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
                  <span>🌈</span>
                  <span>RainbowKit</span>
                </button>

                <button
                  onClick={() => open({ view: 'Connect' })}
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

                <button
                  onClick={connectMetaMask}
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

                <button
                  onClick={connectPhantom}
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