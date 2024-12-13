'use client';

import * as React from 'react';
import { useAccount } from 'wagmi';
import { modal } from '../Context';

type ConnectorButtonProps = {
  name: string;
  onClick: () => Promise<void>;
  isPending?: boolean;
  isMobile?: boolean;
};

type ConnectionStatus = 'idle' | 'connecting' | 'switching' | 'connected' | 'error';

const BASE_CHAIN_ID = 8453;
const CONNECTION_TIMEOUT = 30000;
const SUCCESS_TOAST_DURATION = 1500;
const CONNECTION_CHECK_INTERVAL = 1000;

export function Connect() {
  const { isConnected, address, chain } = useAccount();
  const [status, setStatus] = React.useState<ConnectionStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const mountedRef = React.useRef(false);

  const isMobile = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const userAgent = window.navigator.userAgent || window.navigator.vendor;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    
    return mobileQuery.matches || mobileRegex.test(userAgent);
  }, []);

  const isWrongNetwork = React.useMemo(() => {
    return isConnected && chain?.id !== BASE_CHAIN_ID;
  }, [isConnected, chain?.id]);

  const clearTimers = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetState = React.useCallback(() => {
    clearTimers();
    setStatus('idle');
    setError(null);
    setShowSuccessToast(false);
  }, [clearTimers]);

  const handleSuccess = React.useCallback(() => {
    if (!mountedRef.current) return;
    
    clearTimers();
    setStatus('connected');
    setShowSuccessToast(true);
    setError(null);

    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setShowSuccessToast(false);
      }
    }, SUCCESS_TOAST_DURATION);
  }, [clearTimers]);

  const handleError = React.useCallback((error: unknown) => {
    if (!mountedRef.current) return;

    let message = 'Connection failed. Please try again.';
    if (error instanceof Error) {
      if (error.message.includes('user rejected')) {
        message = 'Connection cancelled. Please try again.';
      } else if (error.message.includes('network') || error.message.includes('chain')) {
        message = 'Please switch to Base network';
      } else if (error.message.includes('timeout')) {
        message = 'Connection timed out. Please check your internet connection.';
      } else {
        message = error.message;
      }
    }

    clearTimers();
    setStatus('error');
    setError(message);
  }, [clearTimers]);

  const startConnectionCheck = React.useCallback(() => {
    clearTimers();
    
    intervalRef.current = setInterval(() => {
      if (isConnected && address) {
        handleSuccess();
      }
    }, CONNECTION_CHECK_INTERVAL);

    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current && !isConnected) {
        clearTimers();
        handleError(new Error('Connection timeout'));
      }
    }, CONNECTION_TIMEOUT);
  }, [isConnected, address, handleSuccess, handleError, clearTimers]);

  const handleConnect = React.useCallback(async () => {
    if (status === 'connecting') return;

    try {
      resetState();
      setStatus('connecting');

      await modal.open({
        view: 'Connect',
        ...(isMobile && { 
          redirectUrl: window.location.href
        })
      });

      startConnectionCheck();
    } catch (error) {
      console.error('Connection failed:', error);
      handleError(error);
    }
  }, [status, isMobile, resetState, startConnectionCheck, handleError]);

  const handleSwitchNetwork = React.useCallback(async () => {
    if (status === 'switching') return;

    try {
      resetState();
      setStatus('switching');

      await modal.open({
        view: 'Networks',
        ...(isMobile && { 
          redirectUrl: window.location.href
        })
      });

      startConnectionCheck();
    } catch (error) {
      console.error('Network switch failed:', error);
      handleError(error);
    }
  }, [status, isMobile, resetState, startConnectionCheck, handleError]);

  React.useEffect(() => {
    mountedRef.current = true;

    if (isConnected && address) {
      handleSuccess();
    }

    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [isConnected, address, handleSuccess, clearTimers]);

  if (isConnected && !isWrongNetwork) {
    return null;
  }

  const isPending = status === 'connecting' || status === 'switching';
  const buttonProps = isWrongNetwork
    ? { name: 'Switch to Base', onClick: handleSwitchNetwork, isPending: status === 'switching' }
    : { name: 'Connect Wallet', onClick: handleConnect, isPending: status === 'connecting' };

  return (
    <div className="container">
      <div className="max-w-md mx-auto space-y-4">
        <ConnectorButton {...buttonProps} isMobile={isMobile} />
        
        {error && (
          <div className="status-message error" role="alert">
            {error}
          </div>
        )}

        {isPending && (
          <div className="mt-4 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out animate-pulse"
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>

      {showSuccessToast && (
        <div className="status-message success fixed top-4 right-4 shadow-lg">
          Successfully connected! ✅
        </div>
      )}

      {isMobile && (
        <div className="connect-notice">
          <div>
            💡 Connection Options:
            <ul className="mt-2 space-y-1 text-left">
              <li>• Open in MetaMask mobile app</li>
              <li>• Use WalletConnect-compatible wallets</li>
              <li>• Connect with email or social accounts</li>
              <li>• Make sure you're on the Base network</li>
            </ul>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Note: If you're using a mobile wallet, you may need to open it first 
            before attempting to connect.
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectorButton({ name, onClick, isPending, isMobile }: ConnectorButtonProps) {
  const handleClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isPending) {
      onClick();
    }
  }, [isPending, onClick]);

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      type="button"
      aria-busy={isPending}
      className={`
        button
        ${isMobile ? 'active:scale-95' : ''}
      `}
    >
      <div className="button-content">
        {isPending ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          getConnectorIcon(name)
        )}
        <span>
          {isPending ? (name.includes('Switch') ? 'Switching...' : 'Connecting...') : name}
        </span>
      </div>
    </button>
  );
}

function getConnectorIcon(name: string): string {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('metamask')) return '🦊';
  if (lowercaseName.includes('walletconnect')) return '🔗';
  if (lowercaseName.includes('switch')) return '🔄';
  return '👛';
}