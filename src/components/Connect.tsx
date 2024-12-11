import * as React from 'react';
import { useConnect, useAccount } from 'wagmi';
import { useSDK } from '@metamask/sdk-react';

type ConnectorButtonProps = {
  name: string;
  onClick: () => void;
  isPending?: boolean;
};

export function Connect() {
  const { sdk } = useSDK();
  const { connectors, connect, error: connectError, status } = useConnect();
  const { isConnected } = useAccount();
  const [connectionInProgress, setConnectionInProgress] = React.useState<string | null>(null);

  const isMobile = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }, []);

  const hasMetaMaskProvider = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.ethereum?.isMetaMask);
  }, []);

  React.useEffect(() => {
    if (connectError) {
      console.error('Connection error:', connectError);
      setConnectionInProgress(null);
      alert(connectError.message || 'Connection failed. Please try again.');
    }
  }, [connectError]);

  const handleConnect = React.useCallback(async (connector: any) => {
    try {
      setConnectionInProgress(connector.id);
      const connectorName = connector.name.toLowerCase();
  
      // Si on est sur mobile et que le connecteur est MetaMask
      if (isMobile && connectorName.includes('metamask')) {
        try {
          console.log('Attempting SDK connection...');
          const accounts = await sdk?.connect();
          console.log('SDK connection result:', accounts);
  
          if (accounts && accounts.length > 0) {
            console.log('SDK connected successfully, connecting Wagmi...');
            await connect({ connector });
          } else {
            console.log('No accounts returned from SDK, falling back to deep linking...');
            window.location.href = `https://metamask.app.link/dapp/${window.location.host}`;
          }
        } catch (error) {
          console.error('SDK connection failed:', error);
          window.location.href = `https://metamask.app.link/dapp/${window.location.host}`;
        }
      } else {
        await connect({ connector });
      }
    } catch (error) {
      console.error('Connection attempt failed:', error);
    } finally {
      setConnectionInProgress(null);
    }
  }, [connect, sdk, isMobile]);

  if (isConnected) {
    return null;
  }

  const availableConnectors = connectors.filter((connector) => {
    const name = connector.name.toLowerCase();
    // Si sur mobile et qu'aucun provider MetaMask n'est présent, on cache le bouton MetaMask
    if (isMobile && name.includes('metamask')) {
      return hasMetaMaskProvider;
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">
        {availableConnectors.map((connector) => (
          <ConnectorButton
            key={connector.id}
            name={connector.name}
            onClick={() => handleConnect(connector)}
            isPending={connectionInProgress === connector.id || status === 'pending'}
          />
        ))}
      </div>

      {isMobile && (
        <div className="mt-6 text-sm text-center text-gray-600 bg-gray-50 p-4 rounded-lg shadow-sm">
          {!hasMetaMaskProvider ? (
            <>
              💡 Pro Tips:
              <ul className="mt-2 space-y-1 text-left">
                <li>• Use WalletConnect for easy connection with any wallet</li>
                <li>• Install MetaMask mobile app for the best experience</li>
                <li>• Make sure you're on the Base network</li>
              </ul>
            </>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🦊 Using MetaMask mobile browser
            </span>
          )}
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
          {isPending ? 'Connecting...' : `Connect with ${name}`}
        </span>
      </div>
    </button>
  );
}

function getConnectorIcon(connectorName: string) {
  const name = connectorName.toLowerCase();
  if (name.includes('metamask')) return '🦊';
  if (name.includes('walletconnect')) return '🔗';
  if (name.includes('coinbase')) return '💰';
  if (name.includes('phantom')) return '👻';
  return '👛';
}
