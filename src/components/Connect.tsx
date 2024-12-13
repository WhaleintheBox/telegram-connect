'use client';

import * as React from 'react';
import { useAccount } from 'wagmi';
import { modal } from '../Context';

const BASE_CHAIN_ID = 8453;
const SUCCESS_TOAST_DURATION = 1500;
const MODAL_CONFIG = {
  theme: 'light' as const,
  modalOptions: {
    closeOnOutsideClick: true,
    closeOnEscape: true,
  }
} as const;

type ConnectionStatus = 'idle' | 'connecting' | 'switching' | 'connected' | 'error';
type ModalAction = 'connecting' | 'switching';

export function Connect() {
  const { isConnected, address, chain, connector } = useAccount();
  const [status, setStatus] = React.useState<ConnectionStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  const mountedRef = React.useRef(false);
  const modalTimeoutRef = React.useRef<NodeJS.Timeout>();
  const actionRef = React.useRef<ModalAction | null>(null);

  // Détection du mobile
  const isMobile = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent || window.navigator.vendor;
    return /android|iphone|ipad|ipod|webos/i.test(userAgent.toLowerCase());
  }, []);

  const isWrongNetwork = React.useMemo(() => {
    return Boolean(isConnected && chain?.id !== BASE_CHAIN_ID);
  }, [isConnected, chain?.id]);

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
    
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setShowSuccessToast(false);
      }
    }, SUCCESS_TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [clearModalTimeout]);

  const handleError = React.useCallback((error: unknown) => {
    if (!mountedRef.current) return;
    console.error('Connection error:', error);
    clearModalTimeout();
    actionRef.current = null;

    let message = 'Connection failed. Please try again.';
    if (error instanceof Error) {
      if (error.message.includes('user rejected')) {
        message = 'Connection cancelled. Please try again.';
      } else if (error.message.includes('network') || error.message.includes('chain')) {
        message = 'Please switch to Base network.';
      } else if (error.message.includes('timeout')) {
        message = 'Connection timed out. Please check your internet connection.';
      } else {
        message = error.message;
      }
    }

    setStatus('error');
    setError(message);
  }, [clearModalTimeout]);

  const handleConnect = React.useCallback(async () => {
    if (actionRef.current === 'connecting') return;

    try {
      setStatus('connecting');
      setError(null);
      actionRef.current = 'connecting';

      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('wagmi.connected');
      }

      // On utilise 'Connect' pour afficher les réseaux sociaux, e-mails et wallets.
      await modal.open({
        view: 'Connect',
        ...MODAL_CONFIG
      });

      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('wagmi.connected', 'true');
      }
      handleSuccess();

      modalTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && actionRef.current === 'connecting') {
          setStatus('error');
          setError('Connection attempt timed out. Please try again.');
          actionRef.current = null;
        }
      }, 30000);

    } catch (error) {
      console.error('Connection failed:', error);
      handleError(error);
    }
  }, [handleError, handleSuccess]);

  const handleSwitchNetwork = React.useCallback(async () => {
    if (actionRef.current === 'switching') return;

    try {
      setStatus('switching');
      setError(null);
      actionRef.current = 'switching';

      await modal.open({
        view: 'Networks',
        ...MODAL_CONFIG
      });

      modalTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && actionRef.current === 'switching') {
          setStatus('error');
          setError('Network switch timed out. Please try again.');
          actionRef.current = null;
        }
      }, 30000);

    } catch (error) {
      console.error('Network switch failed:', error);
      handleError(error);
    }
  }, [handleError]);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      actionRef.current = null;
      clearModalTimeout();
    };
  }, [clearModalTimeout]);

  React.useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    
    const checkConnection = async () => {
      const isConnectedSession = typeof window !== 'undefined' && 
        window.sessionStorage?.getItem('wagmi.connected') === 'true';
      
      if (isConnectedSession && connector && !isConnected) {
        try {
          await connector.connect();
          handleSuccess();
          window.sessionStorage?.removeItem('wagmi.connected');
        } catch (error) {
          console.error('Reconnection error:', error);
          window.sessionStorage?.removeItem('wagmi.connected');
        }
      }
    };

    checkConnection();
    checkInterval = setInterval(checkConnection, 1000);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [isConnected, connector, handleSuccess]);

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

  // Si connecté et sur le bon réseau, ne rien afficher
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
          <div className="status-message error p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" role="alert">
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
          <div className="status-message success fixed top-4 right-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 shadow-lg">
            Successfully connected! ✅
          </div>
        )}
      </div>
    </div>
  );
}

interface ConnectorButtonProps {
  name: string;
  onClick: () => Promise<void>;
  isPending?: boolean;
  isMobile?: boolean;
}

function ConnectorButton({ name, onClick, isPending, isMobile }: ConnectorButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (!isPending) {
          onClick();
        }
      }}
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
        ${isMobile ? 'active:scale-95' : ''}
      `}
    >
      <div className="flex items-center justify-center space-x-2">
        {isPending ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <span className="text-xl">{getConnectorIcon(name)}</span>
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
