'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import type { ConnectionData } from '../utils';
import { sendEvent } from '../utils';

interface ConnectProps {
  onUserConnected?: (address: string) => void;
  uid?: string;
  callbackEndpoint?: string;
  sendEvent?: (data: ConnectionData) => void;
}

export function Connect({ 
  onUserConnected,
  uid,
  sendEvent: propsSendEvent
}: ConnectProps) {
  const { address } = useAccount();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasNotified, setHasNotified] = React.useState(false);
  const { open } = useAppKit();

  const handleError = React.useCallback((error: any) => {
    console.error('Connection error:', error);
    setError('Failed to notify connection. Please try again.');
  }, []);

  const notifyConnection = React.useCallback(async (walletAddress: string) => {
    if (!walletAddress || !uid || hasNotified) return;
  
    try {
      const connectionData = {
        type: 'connect_wallet' as const,
        address: walletAddress,
        connect: true
      };
  
      console.log('Notifying connection with:', connectionData); // Debug log
  
      // Endpoint spécifique pour wallet-connect
      const endpoint = 'https://witbbot-638008614172.us-central1.run.app/wallet-connect';
  
      if (propsSendEvent) {
        propsSendEvent(connectionData);
        setHasNotified(true);
      } else if (uid) {
        await sendEvent(uid, endpoint, handleError, connectionData);
        setHasNotified(true);
      }
    } catch (err) {
      console.error('Failed to notify connection:', err);
      setError('Failed to notify connection. Please try again.');
    }
  }, [uid, hasNotified, propsSendEvent, handleError]);

  React.useEffect(() => {
    if (address) {
      notifyConnection(address);
    }
  }, [address, notifyConnection]);

  const connectMetaMask = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `https://metamask.app.link/dapp/${currentUrl}`;
      } else {
        if (typeof window.ethereum !== 'undefined') {
          try {
            const accounts = await window.ethereum.request({ 
              method: 'eth_requestAccounts' 
            });
            if (accounts[0]) {
              onUserConnected?.(accounts[0]);
              await notifyConnection(accounts[0]);
            }
          } catch (err: any) {
            console.error('MetaMask connection error:', err);
            setError('Failed to connect to MetaMask. Please try again.');
          }
        } else {
          window.open('https://metamask.io/download/', '_blank');
        }
      }
    } catch (err) {
      console.error('MetaMask connection error:', err);
      setError('Failed to connect to MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div style={{ padding: '16px', maxWidth: '420px', margin: '0 auto' }}>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected = 
            ready && 
            account && 
            chain && 
            (!authenticationStatus || authenticationStatus === 'authenticated');

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
                    color: isConnecting ? '#9ca3af' : '#fff',
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
                    color: isConnecting ? '#9ca3af' : '#fff',
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
                    color: isConnecting ? '#9ca3af' : '#fff',
                    border: 'none',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                >
                  <span>🦊</span>
                  <span>MetaMask</span>
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