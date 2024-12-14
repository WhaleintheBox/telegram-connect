'use client';

import * as React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { modal } from '../Context';
import { base } from '@reown/appkit/networks';
import { MetaMaskSDK } from '@metamask/sdk-react';

// Constants
const BASE_CHAIN_ID = base.id;
const SUCCESS_TOAST_DURATION = 1500;

type ConnectionStatus = 'idle' | 'connecting' | 'switching' | 'connected' | 'error';
type PlatformType = 'telegram' | 'ios' | 'android' | 'desktop' | 'unknown';

interface ConnectorButtonProps {
  name: string;
  onClick: () => Promise<void>;
  isPending?: boolean;
  isMobile?: boolean;
  customIcon?: React.ReactNode;
}

// Initialize MetaMask SDK with mobile-optimized settings
const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "Whale in the Box",
    url: window.location.origin,
  },
  checkInstallationImmediately: true,
  preferDesktop: false,
  useDeeplink: true,
});

// Platform detection utilities
function detectPlatform(): PlatformType {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // Telegram WebApp detection
  if ('Telegram' in window || window.location.href.includes('tg://')) {
    return 'telegram';
  }
  
  // iOS detection
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  
  // Android detection
  if (/android/.test(userAgent)) {
    return 'android';
  }
  
  // Desktop detection
  if (window.innerWidth >= 768 && !(/mobile|tablet/.test(userAgent))) {
    return 'desktop';
  }
  
  return 'unknown';
}

function getConnectorIcon(name: string): string {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('metamask')) return '🦊';
  if (lowercaseName.includes('phantom')) return '👻';
  if (lowercaseName.includes('walletconnect')) return '🔗';
  if (lowercaseName.includes('switch')) return '🔄';
  return '👛';
}

function getErrorMessage(error: unknown): string {
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
}

function handleMobileRedirect(walletType: 'metamask' | 'phantom') {
  const platform = detectPlatform();
  const currentUrl = encodeURIComponent(window.location.href);
  
  switch (walletType) {
    case 'metamask':
      if (platform === 'ios') {
        window.location.href = `https://apps.apple.com/app/metamask/id1438144202`;
      } else if (platform === 'android') {
        window.location.href = `https://play.google.com/store/apps/details?id=io.metamask`;
      } else {
        window.location.href = `https://metamask.app.link/dapp/${currentUrl}`;
      }
      break;
      
    case 'phantom':
      if (platform === 'ios') {
        window.location.href = `https://apps.apple.com/app/phantom-crypto-wallet/id1598432977`;
      } else if (platform === 'android') {
        window.location.href = `https://play.google.com/store/apps/details?id=app.phantom`;
      } else {
        window.location.href = `https://phantom.app/ul/browse/${currentUrl}`;
      }
      break;
  }
}

export function Connect() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [status, setStatus] = React.useState<ConnectionStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  
  const platform = React.useMemo(() => detectPlatform(), []);
  const isMobile = platform !== 'desktop';
  const isTelegram = platform === 'telegram';
  
  const isWrongNetwork = React.useMemo(() => (
    Boolean(isConnected && chainId !== BASE_CHAIN_ID)
  ), [isConnected, chainId]);

  React.useEffect(() => {
    if (isConnected) {
      setStatus('connected');
      setShowSuccessToast(true);
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, SUCCESS_TOAST_DURATION);
      return () => clearTimeout(timer);
    } else {
      setStatus('idle');
      setError(null);
    }
  }, [isConnected]);

  const handleError = React.useCallback((err: unknown) => {
    console.error('Connection error:', err);
    setStatus('error');
    setError(getErrorMessage(err));
    
    setTimeout(() => {
      setStatus('idle');
    }, 3000);
  }, []);

  const handleMetaMaskConnect = async () => {
    if (status === 'connecting') return;
    
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
      setStatus('connected');
    } catch (err) {
      handleError(err);
    }
  };

  const handlePhantomConnect = async () => {
    if (status === 'connecting') return;
    
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
      setStatus('connected');
    } catch (err) {
      handleError(err);
    }
  };

  const handleConnect = React.useCallback(async () => {
    if (status === 'connecting') return;
    
    try {
      setStatus('connecting');
      
      if (isTelegram) {
        window.open(window.location.href, '_blank');
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
    if (status === 'switching') return;
    
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

const ConnectorButton: React.FC<ConnectorButtonProps> = React.memo(({ 
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
