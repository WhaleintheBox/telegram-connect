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

  // Clé publique générée pour le chiffrement Phantom
  const [dappKeyPair] = React.useState(nacl.box.keyPair());

  // Notifie Telegram de la connexion (optionnel selon votre cas d'usage)
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

  /**
   * Connexion à Phantom
   */
  const connectPhantom = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        /**
         * ---------------------------
         * PHANTOM DEEPLINK SUR MOBILE
         * ---------------------------
         * Documentation Phantom : https://docs.phantom.com/phantom-deeplinks/provider-methods/connect
         * 
         * On crée un lien universel de type https://phantom.app/ul/v1/connect?...
         * ou https://link.phantom.app/ul/... 
         * (La doc Phantom varie selon la version, adaptez si nécessaire.)
         */
        
        const params = new URLSearchParams({
          // URL de redirection après validation dans Phantom
          redirect_link: window.location.href,
          // Cluster Solana (mainnet, devnet, etc.)
          cluster: 'mainnet',
          // Clé publique de chiffrement (optionnelle, selon vos besoins)
          dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
          // URL de votre appli (optionnel)
          app_url: window.location.origin,
        });

        // Exemple : https://phantom.app/ul/v1/connect
        // Selon la doc, vous pouvez utiliser https://link.phantom.app/ul/ à la place
        const url = `https://phantom.app/ul/v1/connect?${params.toString()}`;

        // Redirige l'utilisateur mobile vers Phantom
        window.location.href = url;
      } else {
        /**
         * ---------------------------
         * PHANTOM CONNECT SUR DESKTOP
         * ---------------------------
         */
        if (window.phantom?.solana) {
          try {
            const response = await window.phantom.solana.connect();
            onUserConnected?.(response.publicKey);
          } catch (err) {
            console.error('Phantom connect error:', err);
            setError('Failed to connect to Phantom. Please try again.');
          }
        } else {
          // Si Phantom n'est pas détecté, on propose de télécharger Phantom
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
   * Connexion à MetaMask
   */
  const connectMetaMask = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      /**
       * --------------------------
       * METAMASK DEEPLINK SUR MOBILE
       * --------------------------
       * Documentation MetaMask : 
       * https://docs.metamask.io/wallet/connect/3rd-party-libraries/wagmi/
       * 
       * On redirige l'utilisateur vers metamask.app.link/dapp/<votre_domaine> 
       * ou n'importe quel format custom (wc:// ...) suivant l’implémentation désirée.
       */
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://metamask.app.link/dapp/${currentUrl}`;
    } else {
      /**
       * ---------------------------
       * METAMASK CONNECT SUR DESKTOP
       * ---------------------------
       */
      if (typeof window.ethereum !== 'undefined') {
        // Si MetaMask est injecté
        window.ethereum.request({ method: 'eth_requestAccounts' })
          .catch((err: any) => {
            console.error('MetaMask connection error:', err);
            setError('Failed to connect to MetaMask. Please try again.');
          });
      } else {
        // Inviter l'utilisateur à installer MetaMask
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
                {/* Bouton RainbowKit (Wagmi) */}
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

                {/* Bouton ReownKit */}
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

                {/* Bouton MetaMask */}
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

                {/* Bouton Phantom */}
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

              {/* Affichage des erreurs */}
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
              
              {/* Si déjà connecté */}
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
