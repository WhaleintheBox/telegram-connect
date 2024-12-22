'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Déclaration globale pour Phantom et Ethereum (MetaMask).
 */
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
  /** Callback pour récupérer l'adresse connectée (facultatif) */
  onUserConnected?: (address: string) => void;
  /** Données Telegram (optionnel) */
  telegramInitData?: string;
  /** Identifiant utilisateur (optionnel) */
  uid?: string;
  /** Endpoint callback (pour notifier un serveur) */
  callbackEndpoint?: string;
  /** Fonction pour envoyer un event (ex: Telegram) */
  sendEvent?: (data: any) => void;
}

export function Connect({ 
  onUserConnected,
  telegramInitData,
  uid,
  callbackEndpoint,
  sendEvent
}: ConnectProps) {
  // Récupération de l'adresse via Wagmi (RainbowKit)
  const { address } = useAccount();

  // État local
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasNotified, setHasNotified] = React.useState(false);

  // AppKit (ReownKit)
  const { open } = useAppKit();

  // Clé publique pour la communication Phantom (optionnel)
  const [dappKeyPair] = React.useState(nacl.box.keyPair());

  /**
   * Notifie Telegram ou un callback endpoint 
   * après que l'utilisateur se soit connecté (via wagmi).
   */
  React.useEffect(() => {
    const notifyConnection = async () => {
      if (address && uid && !hasNotified && (sendEvent || callbackEndpoint)) {
        try {
          const connectionData = {
            type: 'connect_wallet',
            address,
            connect: true,
            initData: telegramInitData,
          };

          // Soit on utilise une fonction "sendEvent" (ex: pour Telegram),
          // soit on POST sur un callbackEndpoint
          if (sendEvent) {
            sendEvent({ ...connectionData, uid });
          } else if (callbackEndpoint) {
            await fetch(callbackEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...connectionData, uid }),
            });
          }
          setHasNotified(true);
        } catch (err) {
          console.error('Failed to notify Telegram or callback:', err);
        }
      }
    };

    notifyConnection();
  }, [address, uid, hasNotified, telegramInitData, sendEvent, callbackEndpoint]);

  /**
   * Connexion à Phantom (SOLANA).
   * Gère mobile (deeplink) et desktop (extension).
   */
  const connectPhantom = async () => {
    try {
      setIsConnecting(true);
      setError(null);
  
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
      if (isMobile) {
        // ---------------------------
        // PHANTOM DEEPLINK SUR MOBILE
        // ---------------------------
        // https://docs.phantom.com/phantom-deeplinks/provider-methods/connect
        // Utilisez "mainnet-beta" (ou devnet/testnet)
  
        const phantomURL = new URL('https://phantom.app/ul/v1/connect');
  
        phantomURL.searchParams.set('redirect_link', window.location.href);
        phantomURL.searchParams.set('app_url', window.location.origin);
        phantomURL.searchParams.set(
          'dapp_encryption_public_key', 
          bs58.encode(dappKeyPair.publicKey)
        );
        phantomURL.searchParams.set('cluster', 'mainnet-beta');
  
        // Redirige l'utilisateur mobile vers l'app Phantom
        window.location.href = phantomURL.toString();
      } else {
        // ---------------------------
        // PHANTOM CONNECT SUR DESKTOP
        // ---------------------------
        if (window.phantom?.solana) {
          try {
            const response = await window.phantom.solana.connect();
            onUserConnected?.(response.publicKey);  // <- callback
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
  
  /**
   * Connexion à MetaMask (EVM).
   * Gère mobile (deeplink) et desktop (extension).
   */
  const connectMetaMask = () => {
    try {
      setIsConnecting(true);
      setError(null);

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        /**
         * --------------------------
         * METAMASK DEEPLINK SUR MOBILE
         * --------------------------
         * La redirection ouvre votre site dans le navigateur in-app de MetaMask.
         * L'utilisateur devra cliquer manuellement sur "Connect" une fois dedans.
         */
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `https://metamask.app.link/dapp/${currentUrl}`;
      } else {
        /**
         * ---------------------------
         * METAMASK SUR DESKTOP
         * ---------------------------
         */
        if (typeof window.ethereum !== 'undefined') {
          window.ethereum
            .request({ method: 'eth_requestAccounts' })
            .catch((err: any) => {
              console.error('MetaMask connection error:', err);
              setError('Failed to connect to MetaMask. Please try again.');
            });
        } else {
          // L'utilisateur n'a pas MetaMask → on propose le téléchargement
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

  /**
   * Affichage du composant 
   * avec le custom RainbowKit + ReownKit + boutons Phantom/MetaMask
   */
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
          // Contrôle que RainbowKit est prêt
          const ready = mounted && authenticationStatus !== 'loading';
          // Vérifie si l'utilisateur est déjà connecté via Wagmi
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
                {/* 1) Bouton RainbowKit (Wagmi) */}
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

                {/* 2) Bouton ReownKit (AppKit) */}
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

                {/* 3) Bouton MetaMask */}
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

                {/* 4) Bouton Phantom (Solana) */}
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

              {/* Affichage d'erreur si la connexion échoue */}
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

              {/* Message si déjà connecté (via Wagmi) */}
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
