'use client';

import * as React from 'react';
import { useAccount } from 'wagmi';
import { modal } from '../Context';

type ConnectorButtonProps = {
  name: string;
  onClick: () => void;
  isPending?: boolean;
};

export function Connect() {
  const { isConnected, address } = useAccount();
  const [connectionInProgress, setConnectionInProgress] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const mountedRef = React.useRef(false);
  const popupRef = React.useRef<Window | null>(null);
  const timeoutRef = React.useRef<number | null>(null);
  const checkIntervalRef = React.useRef<number | null>(null);
  const popupIntervalRef = React.useRef<number | null>(null);

  // Enhanced mobile detection
  const isMobile = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent || window.navigator.vendor;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent) || window.innerWidth <= 768;
  }, []);

  // Cleanup function
  const cleanup = React.useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (checkIntervalRef.current) {
      window.clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (popupIntervalRef.current) {
      window.clearInterval(popupIntervalRef.current);
      popupIntervalRef.current = null;
    }
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
      popupRef.current = null;
    }
  }, []);

  // Component mount/unmount
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Connection state watcher
  React.useEffect(() => {
    if (isConnected && address) {
      cleanup();
      timeoutRef.current = window.setTimeout(() => {
        if (mountedRef.current) {
          window.location.reload();
        }
      }, 1000);
    }
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [isConnected, address, cleanup]);

  const handleConnect = React.useCallback(async () => {
    if (connectionInProgress) return;

    setError(null);
    setConnectionInProgress('connecting');
    cleanup();

    try {
      const popupConfig = !isMobile ? {
        target: '_blank',
        features: 'width=500,height=600,status=yes,toolbar=no,menubar=no,location=no'
      } : undefined;

      await modal.open({
        view: 'Connect',
        ...(popupConfig && {
          popupConfig: {
            ...popupConfig,
            onPopupOpen: (popup: Window) => {
              popupRef.current = popup;
              popupIntervalRef.current = window.setInterval(() => {
                if (!popup || popup.closed) {
                  cleanup();
                  if (mountedRef.current) {
                    setConnectionInProgress(null);
                  }
                }
              }, 500);
            }
          }
        })
      });

      // Check connection status
      checkIntervalRef.current = window.setInterval(() => {
        if (isConnected && address) {
          cleanup();
          window.location.reload();
        }
      }, 1000);

      // Cleanup after 30 seconds
      timeoutRef.current = window.setTimeout(() => {
        if (mountedRef.current) {
          cleanup();
          setConnectionInProgress(null);
        }
      }, 30000);

    } catch (error) {
      console.error('Connection attempt failed:', error);
      if (mountedRef.current) {
        setError(error instanceof Error ? error.message : 'Connection failed');
        cleanup();
      }
    } finally {
      if (!isConnected && mountedRef.current) {
        setConnectionInProgress(null);
      }
    }
  }, [connectionInProgress, isConnected, address, isMobile, cleanup]);

  if (isConnected && address) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">
        <ConnectorButton
          name="Connect Wallet"
          onClick={handleConnect}
          isPending={connectionInProgress === 'connecting'}
        />
        
        {error && (
          <div className="mt-2 text-red-500 text-sm text-center" role="alert">
            {error}
          </div>
        )}
      </div>

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

function ConnectorButton({ name, onClick, isPending }: ConnectorButtonProps) {
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
        transition-all transform
        ${!isPending && 'hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-blue-200/50'}
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
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
  return '👛';
}