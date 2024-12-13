'use client';

import * as React from 'react';
import { useAccount } from 'wagmi';
import { modal } from '../Context';

type ConnectorButtonProps = {
  name: string;
  onClick: () => void;
  isPending?: boolean;
  isMobile?: boolean;
};

const BASE_CHAIN_ID = 8453;

export function Connect() {
  const { isConnected, address, chain } = useAccount();
  const [connectionInProgress, setConnectionInProgress] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  const startTimeRef = React.useRef<number>(0);
  const mountedRef = React.useRef(false);
  const timeoutRef = React.useRef<number | null>(null);
  const checkConnectionRef = React.useRef<number | null>(null);
  const reconnectAttempts = React.useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  // Enhanced mobile detection
  const isMobile = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent || window.navigator.vendor;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent) || window.innerWidth <= 768;
  }, []);

  // Network check
  const isWrongNetwork = React.useMemo(() => {
    return isConnected && chain?.id !== BASE_CHAIN_ID;
  }, [isConnected, chain?.id]);

  // Error message handler
  const getErrorMessage = React.useCallback((error: unknown): string => {
    if (error instanceof Error) {
      if (error.message.includes('user rejected')) {
        return 'Connection cancelled. Please try again.';
      }
      if (error.message.includes('network') || error.message.includes('chain')) {
        return 'Please switch to Base network';
      }
      if (error.message.includes('timeout')) {
        return 'Connection timed out. Please check your internet connection.';
      }
      return error.message;
    }
    return 'Connection failed. Please try again';
  }, []);

  // Cleanup function
  const cleanup = React.useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (checkConnectionRef.current) {
      window.clearInterval(checkConnectionRef.current);
      checkConnectionRef.current = null;
    }
    setShowSuccessToast(false);
  }, []);

  // Component lifecycle
  React.useEffect(() => {
    mountedRef.current = true;
    window.addEventListener('beforeunload', cleanup);
    return () => {
      mountedRef.current = false;
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [cleanup]);

  // Connection state handler
  React.useEffect(() => {
    if (isConnected && address) {
      cleanup();
      setShowSuccessToast(true);
      if (mountedRef.current) {
        timeoutRef.current = window.setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    }
    return cleanup;
  }, [isConnected, address, cleanup]);

  // Network switcher
  const handleSwitchNetwork = React.useCallback(async () => {
    try {
      // Use the "Networks" view instead of "NetworkSwitch"
      await modal.open({
        view: 'Networks',
      });
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }, [getErrorMessage]);

  // Reconnection handler
  const attemptReconnect = React.useCallback(async () => {
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      setError('Unable to reconnect. Please try again later.');
      return;
    }
    reconnectAttempts.current++;
    await handleConnect();
  }, []);

  const handleConnect = React.useCallback(async () => {
    if (connectionInProgress) return;

    setError(null);
    setConnectionInProgress('connecting');
    cleanup();
    startTimeRef.current = Date.now();

    try {
      await modal.open({
        view: 'Connect',
        ...(isMobile && {
          redirectUrl: window.location.href
        })
      });

      // Check connection status
      checkConnectionRef.current = window.setInterval(() => {
        if (isConnected && address) {
          cleanup();
          window.location.reload();
        }
      }, 1000);

      // Security timeout
      timeoutRef.current = window.setTimeout(() => {
        if (mountedRef.current) {
          cleanup();
          setConnectionInProgress(null);
          if (!isConnected) {
            setError('Connection timeout. Please try again.');
            attemptReconnect();
          }
        }
      }, 30000);

    } catch (error) {
      console.error('Connection attempt failed:', error);
      if (mountedRef.current) {
        setError(getErrorMessage(error));
        cleanup();
      }
    } finally {
      if (!isConnected && mountedRef.current) {
        setConnectionInProgress(null);
      }
    }
  }, [connectionInProgress, isConnected, address, isMobile, cleanup, getErrorMessage, attemptReconnect]);

  // Early return if connected and on right network
  if (isConnected && !isWrongNetwork) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">
        {isWrongNetwork ? (
          <ConnectorButton
            name="Switch to Base"
            onClick={handleSwitchNetwork}
            isPending={connectionInProgress === 'switching'}
            isMobile={isMobile}
          />
        ) : (
          <ConnectorButton
            name="Connect Wallet"
            onClick={handleConnect}
            isPending={connectionInProgress === 'connecting'}
            isMobile={isMobile}
          />
        )}
        
        {error && (
          <div className="mt-2 text-red-500 text-sm text-center" role="alert">
            {error}
          </div>
        )}

        {connectionInProgress && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${Math.min(((Date.now() - startTimeRef.current) / 300), 100)}%`
              }}
            />
          </div>
        )}
      </div>

      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-down z-50">
          Successfully connected! ✅
        </div>
      )}

      {isMobile && (
        <div className="mt-6 text-sm text-center text-gray-600 bg-gray-50 p-4 rounded-lg shadow-sm">
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
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (isPending) return;
        onClick();
      }}
      disabled={isPending}
      type="button"
      aria-busy={isPending}
      className={`
        w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 
        text-white font-bold rounded-xl shadow-lg 
        transition-all transform duration-200 ease-in-out
        ${!isPending && 'hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-blue-200/50'}
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
        ${isMobile ? 'active:scale-95' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
    >
      <div className="flex items-center justify-center gap-3">
        {isPending ? (
          <div 
            className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"
            aria-hidden="true"
          />
        ) : (
          getConnectorIcon(name)
        )}
        <span className="text-lg">
          {isPending ? 'Connecting...' : name}
        </span>
      </div>
    </button>
  );
}

function getConnectorIcon(connectorName: string): string {
  const name = connectorName.toLowerCase();
  if (name.includes('metamask')) return '🦊';
  if (name.includes('walletconnect')) return '🔗';
  if (name.includes('connect wallet')) return '👛';
  if (name.includes('switch')) return '🔄';
  return '👛';
}