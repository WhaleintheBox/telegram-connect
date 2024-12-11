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

  const connectToMetaMask = React.useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      // Demande de connexion des comptes
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Vérification que nous avons au moins un compte
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Demande de changement de réseau vers Base
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }], // 8453 en hexadécimal pour Base
        });
      } catch (switchError: any) {
        // Si le réseau n'existe pas, on l'ajoute
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x2105', // 8453 en hexadécimal
                chainName: 'Base',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org']
              }
            ]
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
          // Redirection vers MetaMask sur mobile
          const dappUrl = window.location.href;
          window.location.href = `https://metamask.app.link/dapp/${window.location.host}?dapp_url=${encodeURIComponent(dappUrl)}`;
          return;
        }

        await connectToMetaMask();
      } else {
        // Pour les autres connecteurs, utiliser wagmi
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
  }, [connect, connectToMetaMask, hasMetaMaskProvider, isMobile]);

  if (isConnected) {
    return null;
  }

  // Le reste de votre code pour le rendu reste inchangé
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">
        {connectors.map((connector) => (
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

// Les composants ConnectorButton et getConnectorIcon restent inchangés
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