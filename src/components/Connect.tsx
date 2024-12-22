'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

// Définition des types pour Phantom
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: string }>;
      };
    };
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
  const { address, isConnected } = useAccount();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { open } = useAppKit();
  const [hasNotifiedConnection, setHasNotifiedConnection] = React.useState(false);

  // Notification au service Telegram lors de la connexion
  React.useEffect(() => {
    const notifyConnection = async () => {
      if (isConnected && address && uid && callbackEndpoint && !hasNotifiedConnection) {
        try {
          const connectionData = {
            type: 'connect_wallet',
            address: address,
            connect: true,
            initData: telegramInitData
          };

          if (sendEvent) {
            sendEvent({ ...connectionData, uid });
          } else {
            const response = await fetch(callbackEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...connectionData,
                uid
              }),
            });

            if (response.ok) {
              console.log('Successfully notified bot of wallet connection');
            } else {
              console.error('Failed to notify bot:', await response.text());
            }
          }
          
          setHasNotifiedConnection(true);
        } catch (error) {
          console.error('Error notifying bot of connection:', error);
        }
      }
    };

    notifyConnection();
  }, [isConnected, address, uid, callbackEndpoint, hasNotifiedConnection, telegramInitData, sendEvent]);

  // Reset notification state quand la connexion est perdue
  React.useEffect(() => {
    if (!isConnected) {
      setHasNotifiedConnection(false);
    }
  }, [isConnected]);

  // Connecter avec Phantom
  const connectPhantom = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Rediriger vers l'app Phantom sur mobile
      if (isMobile) {
        window.location.href = 'https://phantom.app/ul/browse/';
        return;
      }

      // Sur desktop, vérifier si Phantom est installé
      if (typeof window !== 'undefined' && window.phantom?.solana) {
        try {
          const response = await window.phantom.solana.connect();
          if (onUserConnected) {
            onUserConnected(response.publicKey);
          }
        } catch (err) {
          console.error('Phantom direct connection error:', err);
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
                  <span>🌈</span>
                  <span>RainbowKit</span>
                </button>

                {/* Reown Button */}
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

                {/* Phantom Button */}
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