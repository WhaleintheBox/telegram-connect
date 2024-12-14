'use client';

import * as React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { modal } from '../Context';
import { base } from '@reown/appkit/networks';
import { MetaMaskSDK } from '@metamask/sdk-react';

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

// Initialize MetaMask SDK with optimized settings
const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "Whale in the Box",
    url: window.location.origin,
  },
  checkInstallationImmediately: false,
  preferDesktop: false,
  useDeeplink: true,
});

// Cached platform detection
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

const getErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'Connection failed. Please try again.';
  }

  const message = error.message.toLowerCase();
  const platform = detectPlatform();

  if (message.includes('user rejected')) {
    return 'Connection rejected. Please try again.';
  }
  if (message.includes('already processing')) {
    return 'Connection in progress. Please wait.';
  }
  if (message.includes('chain mismatch')) {
    return 'Please switch to Base network.';
  }
  if (message.includes('not installed')) {
    switch (platform) {
      case 'telegram':
        return 'Please open in external browser to connect wallet.';
      case 'ios':
        return 'Please install MetaMask from the App Store.';
      case 'android':
        return 'Please install MetaMask from the Play Store.';
      default:
        return 'Please install MetaMask to connect.';
    }
  }

  return error.message;
};

const handleMobileRedirect = (walletType: 'metamask' | 'phantom') => {
  const platform = detectPlatform();
  const currentUrl = encodeURIComponent(window.location.href);
  const storeUrls = {
    metamask: {
      ios: 'https://apps.apple.com/app/metamask/id1438144202',
      android: 'https://play.google.com/store/apps/details?id=io.metamask',
      default: `https://metamask.app.link/dapp/${currentUrl}`
    },
    phantom: {
      ios: 'https://apps.apple.com/app/phantom-crypto-wallet/id1598432977',
      android: 'https://play.google.com/store/apps/details?id=app.phantom',
      default: `https://phantom.app/ul/browse/${currentUrl}`
    }
  };

  const urls = storeUrls[walletType];
  const redirectUrl = platform === 'ios' ? urls.ios : 
                     platform === 'android' ? urls.android : 
                     urls.default;
  
  window.location.href = redirectUrl;
};

export function Connect() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
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

  // Connection stability monitoring
  React.useEffect(() => {
    if (!address || !isConnected) return;
  
    const checkConnection = async () => {
      try {
        const provider = MMSDK.getProvider();
        if (!provider) return;
  
        const accounts = await provider.request({ 
          method: 'eth_accounts' 
        }) as string[];
        
        if (!accounts || !accounts[0] || accounts[0].toLowerCase() !== address?.toLowerCase()) {
          setStatus('idle');
        }
      } catch (err) {
        console.error('Connection check failed:', err);
      }
    };
  
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [address, isConnected]);

  // Telegram deep linking handler
  React.useEffect(() => {
    if (!isTelegram) return;

    const handleTelegramReturn = () => {
      const now = Date.now();
      if (now - lastAttemptRef.current < DEBOUNCE_DELAY) return;
      lastAttemptRef.current = now;

      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('wallet_connected')) {
        setStatus('connected');
      }
    };

    window.addEventListener('focus', handleTelegramReturn);
    return () => window.removeEventListener('focus', handleTelegramReturn);
  }, [isTelegram]);

  // Connection state manager
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

  const handleError = React.useCallback((err: unknown) => {
    console.error('Connection error:', err);
    setStatus('error');
    setError(getErrorMessage(err));
    
    setTimeout(() => {
      setStatus('idle');
      setError(null);
    }, ERROR_DISPLAY_DURATION);
  }, []);

  const isActionAllowed = () => {
    const now = Date.now();
    if (now - lastAttemptRef.current < DEBOUNCE_DELAY) return false;
    lastAttemptRef.current = now;
    return true;
  };

  const handleMetaMaskConnect = async () => {
    if (status === 'connecting' || !isActionAllowed()) return;
    
    try {
      setStatus('connecting');
      const ethereum = MMSDK.getProvider();
      
      if (!ethereum) {
        if (isMobile) {
          handleMobileRedirect('metamask');
          return;
        }
        throw new Error('MetaMask not installed');
      }

      await ethereum.request({ method: 'eth_requestAccounts' });
    } catch (err) {
      handleError(err);
    }
  };

  const handlePhantomConnect = async () => {
    if (status === 'connecting' || !isActionAllowed()) return;
    
    try {
      setStatus('connecting');
      // @ts-ignore
      const provider = window.phantom?.ethereum;
      
      if (!provider) {
        if (isMobile) {
          handleMobileRedirect('phantom');
          return;
        }
        throw new Error('Phantom not installed');
      }

      await provider.request({ method: 'eth_requestAccounts' });
    } catch (err) {
      handleError(err);
    }
  };

  const handleConnect = React.useCallback(async () => {
    if (status === 'connecting' || !isActionAllowed()) return;
    
    try {
      setStatus('connecting');
      
      if (isTelegram) {
        const url = new URL(window.location.href);
        url.searchParams.append('wallet_connect', 'true');
        window.open(url.toString(), '_blank');
        return;
      }
      
      await modal.open({
        view: 'Connect'
      });
    } catch (err) {
      handleError(err);
    }
  }, [status, isTelegram]);

  const handleSwitchNetwork = React.useCallback(async () => {
    if (status === 'switching' || !isActionAllowed()) return;
    
    try {
      setStatus('switching');
      await modal.open({
        view: 'Networks'
      });
    } catch (err) {
      handleError(err);
    }
  }, [status]);

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
            
            <ConnectorButton
              name="Phantom"
              onClick={handlePhantomConnect}
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