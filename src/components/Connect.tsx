'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { z } from 'zod';

// Schema validation
export const ADDRESS_REGEX = /(0x[a-fA-F0-9]{40})/g;

const connectionDataSchema = z.object({
  type: z.literal('connect_wallet'),
  address: z.string(),
  connect: z.boolean(),
  initData: z.string().optional()
});

declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: string }>;
      };
      ethereum?: {
        isPhantom?: boolean;
        request: (args: { method: string; params?: any[] }) => Promise<any>;
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

const sendTelegramEvent = async (
  data: any,
  uid: string,
  endpoint: string,
  onError: (error: any) => void
) => {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", endpoint, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  xhr.onload = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log('Successfully notified bot:', xhr.responseText);
      } else {
        console.error('Failed to notify bot:', xhr.statusText);
        onError({
          status: xhr.status,
          text: xhr.statusText
        });
      }
    }
  };
  
  xhr.onerror = () => {
    console.error('Error notifying bot:', xhr.statusText);
    onError({
      status: xhr.status,
      text: xhr.statusText
    });
  };

  xhr.send(JSON.stringify({
    ...data,
    uid
  }));
};

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
  const [hasNotified, setHasNotified] = React.useState(false);
  const { open } = useAppKit();
  const [dappKeyPair] = React.useState(nacl.box.keyPair());

  const handleError = React.useCallback((error: any) => {
    console.error('Connection error:', error);
    setError('Failed to notify Telegram bot. Please try again.');
  }, []);

  const notifyConnection = React.useCallback(async (walletAddress: string) => {
    if (!walletAddress || !uid || hasNotified) return;

    try {
      const connectionData = {
        type: 'connect_wallet' as const,
        address: walletAddress,
        connect: true,
        initData: telegramInitData
      };

      // Validate the connection data
      const validationResult = connectionDataSchema.safeParse(connectionData);
      if (!validationResult.success) {
        console.error('Invalid connection data:', validationResult.error);
        return;
      }

      if (sendEvent) {
        sendEvent({ ...connectionData, uid });
        setHasNotified(true);
      } else if (callbackEndpoint) {
        await sendTelegramEvent(
          connectionData,
          uid,
          callbackEndpoint,
          handleError
        );
        setHasNotified(true);
      }
    } catch (err) {
      console.error('Failed to notify connection:', err);
      setError('Failed to notify connection. Please try again.');
    }
  }, [uid, hasNotified, telegramInitData, sendEvent, callbackEndpoint, handleError]);

  React.useEffect(() => {
    if (address) {
      notifyConnection(address);
    }
  }, [address, notifyConnection]);

  const connectPhantom = async () => {
    try {
      setIsConnecting(true);
      setError(null);
  
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
      if (isMobile) {
        const phantomURL = new URL('https://phantom.app/ul/v1/connect');
        phantomURL.searchParams.set('redirect_link', window.location.href);
        phantomURL.searchParams.set('app_url', window.location.origin);
        phantomURL.searchParams.set(
          'dapp_encryption_public_key', 
          bs58.encode(dappKeyPair.publicKey)
        );
        phantomURL.searchParams.set('cluster', 'mainnet-beta');
        window.location.href = phantomURL.toString();
      } else {
        if (window.phantom?.solana) {
          try {
            const response = await window.phantom.solana.connect();
            const publicKey = response.publicKey;
            onUserConnected?.(publicKey);
            await notifyConnection(publicKey);
          } catch (err) {
            console.error('Phantom connect error:', err);
            setError('Failed to connect to Phantom. Please try again.');
          }
        } else {
          window.open('https://phantom.app', '_blank');
        }
      }
    } catch (err) {
      console.error('Phantom connection error:', err);
      setError('Failed to connect to Phantom');
    } finally {
      setIsConnecting(false);
    }
  };

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
                    color: isConnecting ? '#9ca3af' : '#fff',
                    border: 'none',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                >
                  <span>🌈</span>
                  <span>RainbowKit</span>
                </button>

                {/* ReownKit Button */}
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

                {/* MetaMask Button */}
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
                    color: isConnecting ? '#9ca3af' : '#fff',
                    border: 'none',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                >
                  <span>👻</span>
                  <span>Phantom</span>
                </button>
              </div>

              {/* Error Display */}
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

              {/* Connected Status */}
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