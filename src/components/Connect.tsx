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
type ModalAction = 'connecting' | 'switching';

interface ConnectorButtonProps {
  name: string;
  onClick: () => Promise<void>;
  isPending?: boolean;
  isMobile?: boolean;
  customIcon?: React.ReactNode;
}

// Initialize MetaMask SDK
const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "Whale in the Box",
    url: window.location.origin,
  }
});

// Utility functions
function detectMobile(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent || window.navigator.vendor;
  const isMobileDevice = /android|iphone|ipad|ipod|webos/i.test(userAgent.toLowerCase());
  const isMobileWidth = window.innerWidth < 768;
  return isMobileDevice || isMobileWidth;
}

function getConnectorIcon(name: string): string {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('metamask')) return '🦊';
  if (lowercaseName.includes('phantom')) return '👻';
  if (lowercaseName.includes('walletconnect')) return '🔗';
  if (lowercaseName.includes('switch')) return '🔄';
  if (lowercaseName.includes('google')) return '🔵';
  if (lowercaseName.includes('apple')) return '🍎';
  if (lowercaseName.includes('twitter')) return '🐦';
  if (lowercaseName.includes('facebook')) return '📘';
  if (lowercaseName.includes('rainbow')) return '🌈';
  if (lowercaseName.includes('trust')) return '💠';
  if (lowercaseName.includes('ledger')) return '💼';
  if (lowercaseName.includes('coinbase')) return '📱';
  return '👛';
}

function getErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) {
    return 'Connection failed. Please try again.';
  }

  const message = err.message.toLowerCase();

  if (message.includes('user rejected')) {
    return 'Connection rejected. Please try again.';
  }

  if (message.includes('already processing')) {
    return 'Connection already in progress. Please wait.';
  }

  if (message.includes('chain mismatch')) {
    return 'Please switch to Base network and try again.';
  }

  return err.message;
}

export function Connect() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [status, setStatus] = React.useState<ConnectionStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  
  const mountedRef = React.useRef(false);
  const actionRef = React.useRef<ModalAction | null>(null);
  
  const isMobile = React.useMemo(() => detectMobile(), []);
  
  const isWrongNetwork = React.useMemo(() => (
    Boolean(isConnected && chainId !== BASE_CHAIN_ID)
  ), [isConnected, chainId]);

  // Reset status when component mounts or when connection state changes
  React.useEffect(() => {
    if (isConnected) {
      setStatus('connected');
      setShowSuccessToast(true);
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          setShowSuccessToast(false);
        }
      }, SUCCESS_TOAST_DURATION);
      return () => clearTimeout(timer);
    } else {
      setStatus('idle');
    }
  }, [isConnected]);

  const handleError = React.useCallback((err: unknown) => {
    if (!mountedRef.current) return;
    
    console.error('Connection error:', err);
    setStatus('error');
    setError(getErrorMessage(err));
    actionRef.current = null;
  }, []);

  const handleMetaMaskConnect = async () => {
    if (status === 'connecting') return;
    
    try {
      setStatus('connecting');
      const ethereum = MMSDK.getProvider();
      if (!ethereum) {
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
      const provider = window.phantom?.solana;
      
      if (!provider) {
        window.open('https://phantom.app/', '_blank');
        throw new Error('Phantom not installed');
      }

      const resp = await provider.connect();
      console.log('Connected with Public Key:', resp.publicKey.toString());
      setStatus('connected');
    } catch (err) {
      handleError(err);
    }
  };

  const handleConnect = React.useCallback(async () => {
    if (status === 'connecting') return;
    
    try {
      setStatus('connecting');
      actionRef.current = 'connecting';
      
      await modal.open({
        view: 'Connect'
      });
    } catch (err) {
      handleError(err);
      setStatus('idle');
      actionRef.current = null;
    }
  }, [status, handleError]);

  const handleSwitchNetwork = React.useCallback(async () => {
    if (status === 'switching') return;
    
    try {
      setStatus('switching');
      actionRef.current = 'switching';
      
      await modal.open({
        view: 'Networks'
      });
    } catch (err) {
      handleError(err);
      setStatus('idle');
      actionRef.current = null;
    }
  }, [status, handleError]);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      actionRef.current = null;
    };
  }, []);

  // Si déjà connecté et sur le bon réseau, ne pas afficher le bouton
  if (isConnected && !isWrongNetwork) {
    return null;
  }

  const isPending = status === 'connecting' || status === 'switching';

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-md mx-auto space-y-4">
        {!isWrongNetwork && (
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

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or connect with</span>
              </div>
            </div>
          </>
        )}

        <ConnectorButton
          name={isWrongNetwork ? 'Switch to Base' : 'Other Wallets'}
          onClick={isWrongNetwork ? handleSwitchNetwork : handleConnect}
          isPending={isPending}
          isMobile={isMobile}
        />
        
        {error && (
          <div 
            className="status-message error p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" 
            role="alert"
          >
            {error}
          </div>
        )}

        {isPending && (
          <div className="mt-4 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full w-full bg-blue-600 rounded-full transition-all duration-300 ease-out animate-pulse"
            />
          </div>
        )}

        {showSuccessToast && (
          <div className="status-message success fixed top-4 right-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 shadow-lg animate-fade-in">
            Successfully connected! ✅
          </div>
        )}
      </div>
    </div>
  );
}

function ConnectorButton({ name, onClick, isPending, isMobile, customIcon }: ConnectorButtonProps) {
  const handleClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isPending) onClick();
  }, [onClick, isPending]);

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`
        w-full px-4 py-3 text-white font-semibold rounded-lg
        flex items-center justify-center gap-2
        transition-all duration-200
        ${isPending
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }
        ${isMobile ? 'active:scale-95 touch-manipulation' : ''}
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
}
