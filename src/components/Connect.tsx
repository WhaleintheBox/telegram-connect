'use client';

import * as React from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

// Constants
const BASE_CHAIN_ID = 8453;
const SUCCESS_TOAST_DURATION = 1500;
const CONNECTION_TIMEOUT = 60000; // Increased timeout for mobile browsers

type ConnectionStatus = 'idle' | 'connecting' | 'switching' | 'connected' | 'error';
type ModalAction = 'connecting' | 'switching';

interface ConnectorButtonProps {
  name: string;
  onClick: () => Promise<void>;
  isPending?: boolean;
  isMobile?: boolean;
}

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
    return 'Connection cancelled. Please try again.';
  }
  if (message.includes('network') || message.includes('chain')) {
    return 'Please switch to Base network.';
  }
  if (message.includes('timeout')) {
    return 'Connection timed out. Please check your internet connection and try again.';
  }
  if (message.includes('provider not found')) {
    return 'Please install a supported wallet or use social login.';
  }
  if (message.includes('social auth')) {
    return 'Social authentication failed. Please try again or use a different method.';
  }
  if (message.includes('deep linking')) {
    return 'Opening wallet app... Please approve the connection request.';
  }
  return err.message;
}

export function Connect() {
  const { isConnected, address, chain } = useAccount();
  const { open } = useAppKit();
  const [status, setStatus] = React.useState<ConnectionStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  
  const mountedRef = React.useRef(false);
  const modalTimeoutRef = React.useRef<NodeJS.Timeout>();
  const actionRef = React.useRef<ModalAction | null>(null);
  const retryCountRef = React.useRef(0);
  
  const isMobile = React.useMemo(() => detectMobile(), []);
  const isWrongNetwork = React.useMemo(() => (
    Boolean(isConnected && chain?.id !== BASE_CHAIN_ID)
  ), [isConnected, chain?.id]);

  const clearModalTimeout = React.useCallback(() => {
    if (modalTimeoutRef.current) {
      clearTimeout(modalTimeoutRef.current);
      modalTimeoutRef.current = undefined;
    }
  }, []);

  const handleSuccess = React.useCallback(() => {
    if (!mountedRef.current) return;
    
    setStatus('connected');
    setShowSuccessToast(true);
    setError(null);
    clearModalTimeout();
    actionRef.current = null;
    retryCountRef.current = 0;
    
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setShowSuccessToast(false);
      }
    }, SUCCESS_TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [clearModalTimeout]);

  const handleError = React.useCallback((err: unknown) => {
    if (!mountedRef.current) return;
    
    console.error('Connection error:', err);
    clearModalTimeout();
    actionRef.current = null;
    setStatus('error');
    setError(getErrorMessage(err));

    // Auto-retry for certain errors on mobile
    if (isMobile && retryCountRef.current < 2 && err instanceof Error) {
      const message = err.message.toLowerCase();
      if (message.includes('provider not found') || message.includes('network error')) {
        retryCountRef.current += 1;
        setTimeout(() => {
          if (mountedRef.current) {
            handleConnect();
          }
        }, 1000);
      }
    }
  }, [clearModalTimeout, isMobile]);

  const handleConnect = React.useCallback(async () => {
    if (actionRef.current === 'connecting') return;

    try {
      setStatus('connecting');
      setError(null);
      actionRef.current = 'connecting';

      await open({
        view: 'Connect'
      });

      handleSuccess();

      modalTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && actionRef.current === 'connecting') {
          setStatus('error');
          setError('Connection attempt timed out. Please try again.');
          actionRef.current = null;
        }
      }, CONNECTION_TIMEOUT);

    } catch (err) {
      handleError(err);
    }
  }, [handleError, handleSuccess, open]);

  const handleSwitchNetwork = React.useCallback(async () => {
    if (actionRef.current === 'switching') return;

    try {
      setStatus('switching');
      setError(null);
      actionRef.current = 'switching';

      await open({
        view: 'Networks'
      });

      modalTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && actionRef.current === 'switching') {
          setStatus('error');
          setError('Network switch timed out. Please try again.');
          actionRef.current = null;
        }
      }, CONNECTION_TIMEOUT);

    } catch (err) {
      handleError(err);
    }
  }, [handleError, open]);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      actionRef.current = null;
      clearModalTimeout();
    };
  }, [clearModalTimeout]);

  React.useEffect(() => {
    if (isConnected && address && status !== 'connected') {
      handleSuccess();
    }
  }, [isConnected, address, status, handleSuccess]);

  React.useEffect(() => {
    if (isConnected && chain?.id === BASE_CHAIN_ID && status === 'switching') {
      handleSuccess();
    }
  }, [isConnected, chain?.id, status, handleSuccess]);

  if (isConnected && !isWrongNetwork) {
    return null;
  }

  const isPending = status === 'connecting' || status === 'switching';
  const buttonProps = isWrongNetwork
    ? { name: 'Switch to Base', onClick: handleSwitchNetwork, isPending: status === 'switching' }
    : { name: 'Connect Wallet', onClick: handleConnect, isPending: status === 'connecting' };

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-md mx-auto space-y-4">
        <ConnectorButton {...buttonProps} isMobile={isMobile} />
        
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

function ConnectorButton({ name, onClick, isPending, isMobile }: ConnectorButtonProps) {
  const handleClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isPending) onClick();
  }, [isPending, onClick]);

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      type="button"
      aria-busy={isPending}
      className={`
        w-full px-4 py-2 
        bg-blue-600 hover:bg-blue-700 
        disabled:bg-blue-400 
        text-white font-medium 
        rounded-lg shadow-sm 
        transition-all duration-200 
        flex items-center justify-center 
        space-x-2
        ${isMobile ? 'active:scale-95 touch-manipulation' : ''}
      `}
    >
      <div className="flex items-center justify-center space-x-2">
        {isPending ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <span className="text-xl select-none">{getConnectorIcon(name)}</span>
        )}
        <span>
          {isPending ? (name.includes('Switch') ? 'Switching...' : 'Connecting...') : name}
        </span>
      </div>
    </button>
  );
}
