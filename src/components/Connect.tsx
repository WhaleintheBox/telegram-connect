import * as React from 'react';
import { useConnect, useAccount } from 'wagmi';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (params: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (params: any) => void) => void;
      removeListener: (event: string, callback: (params: any) => void) => void;
    };
  }
}

type ConnectorButtonProps = {
  name: string;
  onClick: () => void;
  isPending?: boolean;
};

export function Connect() {
  const { connectors, connect, status } = useConnect();
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

  const handleMetaMaskDeepLink = React.useCallback(() => {
    const universalLink = `https://metamask.app.link/dapp/whaleinthebox.github.io/telegram-connect/dist/`;
    window.location.href = universalLink;
  }, []);

  const connectToMetaMask = React.useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }]
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org']
            }]
          });
        } else {
          throw switchError;
        }
      }

      return accounts[0];
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      throw error;
    }
  }, []);

  const handleConnect = React.useCallback(async (connector: any) => {
    try {
      setConnectionInProgress(connector.id);
      const connectorName = connector.name.toLowerCase();

      if (connectorName.includes('metamask')) {
        if (!hasMetaMaskProvider && isMobile) {
          handleMetaMaskDeepLink();
          return;
        }

        await connectToMetaMask();
      } else {
        await connect({ connector });
      }
    } catch (error) {
      console.error('Connection attempt failed:', error);
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setConnectionInProgress(null);
    }
  }, [connect, connectToMetaMask, hasMetaMaskProvider, isMobile, handleMetaMaskDeepLink]);

  if (isConnected) {
    return null;
  }

  // Modification ici : on filtre pour garder MetaMask et supprimer WalletConnect sur mobile
  const availableConnectors = connectors.filter((connector) => {
    const name = connector.name.toLowerCase();
    
    if (isMobile) {
      // Sur mobile, on garde uniquement MetaMask
      return name.includes('metamask');
    }
    
    // Sur desktop, on affiche tous les connecteurs
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
              💡 Important:
              <ul className="mt-2 space-y-1 text-left">
                <li>• Install MetaMask mobile app to connect</li>
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