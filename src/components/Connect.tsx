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
  const { isConnected } = useAccount();
  const [connectionInProgress, setConnectionInProgress] = React.useState<string | null>(null);

  const isMobile = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }, []);

  const handleConnect = React.useCallback(async () => {
    try {
      setConnectionInProgress('connecting');
      await modal.open();
    } catch (error) {
      console.error('Connection attempt failed:', error);
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setConnectionInProgress(null);
    }
  }, []);

  if (isConnected) {
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
      </div>

      {isMobile && (
        <div className="mt-6 text-sm text-center text-gray-600 bg-gray-50 p-4 rounded-lg shadow-sm">
          <div>
            💡 Connection Options:
            <ul className="mt-2 space-y-1 text-left">
              <li>• Connect with email or social accounts</li>
              <li>• Use MetaMask or other wallets</li>
              <li>• Make sure you're on the Base network</li>
            </ul>
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
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
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

function getConnectorIcon(connectorName: string) {
  const name = connectorName.toLowerCase();
  if (name.includes('metamask')) return '🦊';
  if (name.includes('walletconnect')) return '🔗';
  if (name.includes('connect wallet')) return '👛';
  return '👛';
}