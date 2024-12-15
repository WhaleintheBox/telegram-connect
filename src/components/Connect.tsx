'use client';

import * as React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { modal } from '../Context';
import { base } from '@reown/appkit/networks';
import { MetaMaskProvider, useSDK } from '@metamask/sdk-react';

const BASE_CHAIN_ID = base.id;
const SUCCESS_TOAST_DURATION = 1500;

type ConnectionStatus = 'idle' | 'connecting' | 'switching' | 'connected' | 'error';
type PlatformType = 'telegram' | 'ios' | 'android' | 'desktop' | 'unknown';

interface ConnectorButtonProps {
  name: string;
  onClick: () => Promise<void>;
  isPending?: boolean;
  icon?: string;
  className?: string;
}

// Détecte la plateforme
const detectPlatform = (): PlatformType => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if ('Telegram' in window || window.location.href.includes('tg://')) {
    return 'telegram';
  }
  
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  if (window.innerWidth >= 768 && !(/mobile|tablet/.test(userAgent))) return 'desktop';
  
  return 'unknown';
};

// Gère la redirection vers le wallet sur mobile
const handleWalletRedirect = (walletType: 'metamask' | 'phantom') => {
  const platform = detectPlatform();
  const currentUrl = encodeURIComponent(window.location.href);

  // Liens universels / fallback
  const urls = {
    metamask: {
      ios: 'https://apps.apple.com/app/metamask/id1438144202',
      android: 'https://play.google.com/store/apps/details?id=io.metamask',
      universal: `metamask://dapp/${currentUrl}`
    },
    phantom: {
      ios: 'https://apps.apple.com/app/phantom-crypto-wallet/id1598432977',
      android: 'https://play.google.com/store/apps/details?id=app.phantom',
      // Tentative d'ouvrir directement l'app phantom si installée
      universal: `phantom://browse/${currentUrl}`
    }
  };

  let url = urls[walletType].universal;
  
  // Si on est sur iOS ou Android, on tente d'abord le lien universel
  // Si l'application n'est pas installée, l'utilisateur pourra installer via l'App/Play Store
  // On peut éventuellement mettre un setTimeout pour rediriger vers le store si l'app n'est pas détectée
  if (platform === 'ios' && walletType === 'phantom') {
    // On va tenter phantom:// directement. Si l'utilisateur n'a pas Phantom, iOS devrait proposer l'installation
    url = urls[walletType].universal;
  } else if (platform === 'android' && walletType === 'phantom') {
    // Idem pour Android
    url = urls[walletType].universal;
  }

  if (platform === 'ios' && walletType === 'metamask') {
    url = urls[walletType].universal;
  } else if (platform === 'android' && walletType === 'metamask') {
    url = urls[walletType].universal;
  }

  // Redirection
  window.location.href = url;
};

function ConnectInner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { sdk } = useSDK();
  const [status, setStatus] = React.useState<ConnectionStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  
  const platform = React.useMemo(() => detectPlatform(), []);
  const isMobile = platform !== 'desktop';
  const isTelegram = platform === 'telegram';
  
  const isWrongNetwork = React.useMemo(() => (
    isConnected && chainId !== BASE_CHAIN_ID
  ), [isConnected, chainId]);

  const connectMetaMask = async () => {
    if (status === 'connecting') return;
    
    try {
      setStatus('connecting');
      
      if (!sdk) {
        if (isMobile) {
          handleWalletRedirect('metamask');
          return;
        }
        throw new Error('MetaMask non installé sur ce navigateur.');
      }

      await sdk.connect();
      setShowSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Échec de la connexion à MetaMask.');
      setStatus('error');
    } finally {
      setStatus('idle');
    }
  };

  const connectPhantom = async () => {
    if (status === 'connecting') return;
    
    try {
      setStatus('connecting');
      // @ts-ignore
      const provider = window.phantom?.ethereum;
      
      if (!provider) {
        if (isMobile) {
          handleWalletRedirect('phantom');
          return;
        }
        throw new Error('Phantom non installé sur ce navigateur.');
      }

      await provider.request({ method: 'eth_requestAccounts' });
      setShowSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Échec de la connexion à Phantom.');
      setStatus('error');
    } finally {
      setStatus('idle');
    }
  };

  const connectWalletConnect = async () => {
    if (status === 'connecting') return;
    
    try {
      setStatus('connecting');
      
      if (isTelegram) {
        // Ouvre dans un navigateur externe (Telegram WebApp est limité)
        window.open(window.location.href, '_blank');
        return;
      }
      
      await modal.open({
        view: 'Connect'
      });
      
      setShowSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Échec de la connexion via WalletConnect.');
      setStatus('error');
    } finally {
      setStatus('idle');
    }
  };

  React.useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), SUCCESS_TOAST_DURATION);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  if (isConnected && !isWrongNetwork) {
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-md mx-auto space-y-4">
        {!isWrongNetwork && (
          <>
            <ConnectorButton
              name="MetaMask"
              onClick={connectMetaMask}
              isPending={status === 'connecting'}
              icon="🦊"
            />
            
            <ConnectorButton
              name="Phantom"
              onClick={connectPhantom}
              isPending={status === 'connecting'}
              icon="👻"
            />

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Plus d'options
                </span>
              </div>
            </div>

            <ConnectorButton
              name="WalletConnect"
              onClick={connectWalletConnect}
              isPending={status === 'connecting'}
              icon="🔗"
              className="bg-blue-600 hover:bg-blue-700"
            />
          </>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="fixed top-4 right-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 shadow-lg animate-fade-in">
            Connecté avec succès ! ✅
          </div>
        )}
      </div>
    </div>
  );
}

const ConnectorButton: React.FC<ConnectorButtonProps> = React.memo(({
  name,
  onClick,
  isPending,
  icon,
  className = "bg-blue-600 hover:bg-blue-700"
}) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      if (!isPending) onClick();
    }}
    disabled={isPending}
    className={`
      w-full px-4 py-3
      font-semibold rounded-lg
      flex items-center justify-center gap-2
      transition-all duration-200
      text-white
      ${isPending ? 'bg-gray-400 cursor-not-allowed' : className}
    `}
  >
    {isPending ? (
      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
    ) : (
      <span className="text-xl">{icon}</span>
    )}
    <span>
      {isPending ? 'Connexion...' : name}
    </span>
  </button>
));

export function Connect() {
  return (
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "Whale in the Box",
          url: typeof window !== 'undefined' ? window.location.origin : "https://whaleinthebox.github.io/telegram-connect/dist/",
        },
        checkInstallationImmediately: false,
        preferDesktop: false,
        useDeeplink: true
      }}
    >
      <ConnectInner />
    </MetaMaskProvider>
  );
}
