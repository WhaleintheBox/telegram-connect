'use client';

import * as React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { base } from '@reown/appkit/networks';
import { useAppKit } from '@reown/appkit/react';

// Constants
const BASE_CHAIN_ID = base.id;
const SUCCESS_TOAST_DURATION = 1500;
const DEBOUNCE_DELAY = 1000;
const ERROR_DISPLAY_DURATION = 3000;

type ConnectionStatus = 'idle' | 'connecting' | 'switching' | 'connected' | 'error';
type PlatformType = 'telegram' | 'ios' | 'android' | 'desktop' | 'unknown';

interface ConnectorButtonProps {
  name: string;
  onClick: () => Promise<void>;
  isPending?: boolean;
  isMobile?: boolean;
  customIcon?: React.ReactNode;
}

// Helpers
const requestAccounts = async (provider: Record<string, unknown>) => {
  if (typeof provider.request !== 'function') {
    throw new Error('Invalid provider');
  }
  return provider.request({ 
    method: 'eth_requestAccounts' 
  }) as Promise<string[]>;
};

// Platform detection with cache
const detectPlatform = (() => {
  let cachedPlatform: PlatformType | null = null;
  return (): PlatformType => {
    if (cachedPlatform) return cachedPlatform;
    if (typeof window === 'undefined') return 'unknown';

    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if ('Telegram' in window || window.location.href.includes('tg://')) {
      cachedPlatform = 'telegram';
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      cachedPlatform = 'ios';
    } else if (/android/.test(userAgent)) {
      cachedPlatform = 'android';
    } else if (window.innerWidth >= 768 && !(/mobile|tablet/.test(userAgent))) {
      cachedPlatform = 'desktop';
    } else {
      cachedPlatform = 'unknown';
    }
    return cachedPlatform;
  };
})();

const getConnectorIcon = (name: string): string => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('metamask')) return '🦊';
  if (lowercaseName.includes('phantom')) return '👻';
  if (lowercaseName.includes('walletconnect')) return '🔗';
  if (lowercaseName.includes('switch')) return '🔄';
  return '👛';
};

export function Connect() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const appKit = useAppKit();
  const [status, setStatus] = React.useState<ConnectionStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  const lastAttemptRef = React.useRef<number>(0);
  
  const platform = React.useMemo(() => detectPlatform(), []);
  const isMobile = platform !== 'desktop';
  const isTelegram = platform === 'telegram';
  
  const isWrongNetwork = React.useMemo(() => (
    Boolean(isConnected && chainId !== BASE_CHAIN_ID)
  ), [isConnected, chainId]);

  // Vérification de la connexion
  React.useEffect(() => {
    if (!address || !isConnected) return;

    const checkConnection = async () => {
      try {
        const provider = window?.ethereum;
        if (!provider) return;

        const accounts = await requestAccounts(provider);
        
        if (Array.isArray(accounts) && accounts[0]?.toLowerCase() !== address?.toLowerCase()) {
          setStatus('idle');
        }
      } catch (err) {
        console.error('Connection check failed:', err);
      }
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [address, isConnected]);

  // Gestion de Telegram
  React.useEffect(() => {
    if (!isTelegram) return;

    const saveReturnUrl = () => {
      const currentUrl = window.location.href;
      localStorage.setItem('telegram_return_url', currentUrl);
    };

    const handleTelegramReturn = () => {
      const now = Date.now();
      if (now - lastAttemptRef.current < DEBOUNCE_DELAY) return;
      lastAttemptRef.current = now;

      const returnUrl = localStorage.getItem('telegram_return_url');
      if (returnUrl) {
        localStorage.removeItem('telegram_return_url');
        window.location.href = returnUrl;
      }
    };

    saveReturnUrl();
    window.addEventListener('focus', handleTelegramReturn);
    return () => window.removeEventListener('focus', handleTelegramReturn);
  }, [isTelegram]);

  // Gestion de l'état de connexion
  React.useEffect(() => {
    if (!isConnected) return;
    
    setStatus('connected');
    setShowSuccessToast(true);
    setError(null);
    
    const timer = setTimeout(() => {
      setShowSuccessToast(false);
    }, SUCCESS_TOAST_DURATION);
    
    return () => clearTimeout(timer);
  }, [isConnected]);

  const handleMetaMaskConnect = async () => {
    if (status === 'connecting') return;
    
    const now = Date.now();
    if (now - lastAttemptRef.current < DEBOUNCE_DELAY) return;
    lastAttemptRef.current = now;
    
    try {
      setStatus('connecting');
      
      if (isTelegram) {
        const url = new URL(window.location.href);
        url.searchParams.set('action', 'connect');
        window.open(url.toString(), '_blank');
        return;
      }

      const provider = window?.ethereum;
      if (!provider) {
        if (isMobile) {
          const currentUrl = encodeURIComponent(window.location.href);
          window.location.href = `https://metamask.app.link/dapp/${currentUrl}`;
          return;
        }
        throw new Error('Please install MetaMask');
      }

      const accounts = await requestAccounts(provider);

      if (!Array.isArray(accounts) || !accounts[0]) {
        throw new Error('No accounts found');
      }

      setStatus('connected');
    } catch (err) {
      console.error('Connection error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Connection failed');
      setTimeout(() => {
        setStatus('idle');
        setError(null);
      }, ERROR_DISPLAY_DURATION);
    }
  };

  const handleConnect = React.useCallback(async () => {
    if (status === 'connecting') return;
    
    const now = Date.now();
    if (now - lastAttemptRef.current < DEBOUNCE_DELAY) return;
    lastAttemptRef.current = now;
    
    try {
      setStatus('connecting');
      
      if (isTelegram) {
        const url = new URL(window.location.href);
        url.searchParams.set('action', 'connect');
        window.open(url.toString(), '_blank');
        return;
      }
      
      await appKit.open({
        view: 'Connect'
      });
    } catch (err) {
      console.error('Connection error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Connection failed');
      setTimeout(() => {
        setStatus('idle');
        setError(null);
      }, ERROR_DISPLAY_DURATION);
    }
  }, [status, isTelegram, appKit]);

  const handleSwitchNetwork = React.useCallback(async () => {
    if (status === 'switching') return;
    
    const now = Date.now();
    if (now - lastAttemptRef.current < DEBOUNCE_DELAY) return;
    lastAttemptRef.current = now;
    
    try {
      setStatus('switching');
      await appKit.open({
        view: 'Networks'
      });
    } catch (err) {
      console.error('Network switch error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Network switch failed');
      setTimeout(() => {
        setStatus('idle');
        setError(null);
      }, ERROR_DISPLAY_DURATION);
    }
  }, [status, appKit]);

  if (isConnected && !isWrongNetwork) {
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-md mx-auto space-y-4">
        {!isWrongNetwork && !isTelegram && (
          <>
            <ConnectorButton
              name="MetaMask"
              onClick={handleMetaMaskConnect}
              isPending={status === 'connecting'}
              isMobile={isMobile}
            />

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isMobile ? 'More options' : 'Or connect with'}
                </span>
              </div>
            </div>
          </>
        )}

        <ConnectorButton
          name={isWrongNetwork ? 'Switch to Base' : isTelegram ? 'Connect Wallet' : 'Other Wallets'}
          onClick={isWrongNetwork ? handleSwitchNetwork : handleConnect}
          isPending={status === 'connecting' || status === 'switching'}
          isMobile={isMobile}
        />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {status === 'connecting' && (
          <div className="mt-4 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-full bg-blue-600 rounded-full animate-pulse" />
          </div>
        )}

        {showSuccessToast && (
          <div className="fixed top-4 right-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 shadow-lg animate-fade-in">
            Successfully connected! ✅
          </div>
        )}
      </div>
    </div>
  );
}

const ConnectorButton = React.memo<ConnectorButtonProps>(({ 
  name, 
  onClick, 
  isPending, 
  isMobile,
  customIcon 
}) => {
  const handleClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isPending) onClick();
  }, [onClick, isPending]);

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`
        w-full px-4 py-3 
        font-semibold rounded-lg
        flex items-center justify-center gap-2
        transition-all duration-200 ease-out
        ${isPending 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }
        ${isMobile ? 'text-lg active:scale-98 touch-manipulation' : 'text-base'}
        text-white
      `}
    >
      {isPending ? (
        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
      ) : (
        customIcon || <span className="text-xl select-none">{getConnectorIcon(name)}</span>
      )}
      <span>
        {isPending ? (name.includes('Switch') ? 'Switching...' : 'Connecting...') : name}
      </span>
    </button>
  );
});

ConnectorButton.displayName = 'ConnectorButton';