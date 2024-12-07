import * as React from 'react';
import { Connector, useConnect, useAccount } from 'wagmi';

// Constants
const CHAIN_ID = 8453; // Base chain

// Types
type ConnectorButtonProps = {
  connector: Connector;
  onClick: () => void;
};

// Utils
const detectMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  } catch {
    return false;
  }
};

export function Connect() {
  const { connectors, connect, error: connectError } = useConnect();
  const { isConnected } = useAccount();

  // Memoized device detection
  const isMobile = React.useMemo(detectMobile, []);
  
  const isMetaMaskMobile = React.useMemo(() => {
    if (!isMobile || typeof window === 'undefined') return false;
    
    try {
      return Boolean(window.ethereum?.isMetaMask);
    } catch {
      return false;
    }
  }, [isMobile]);

  // Error handling
  React.useEffect(() => {
    if (connectError) {
      console.error('Connection error:', connectError);
    }
  }, [connectError]);

  const handleConnect = React.useCallback(async (connector: Connector) => {
    try {
      const isInjected = connector.name.toLowerCase().includes('injected');
      
      if (isMobile && !isMetaMaskMobile && isInjected) {
        const walletConnectConnector = connectors.find(c => 
          c.name.toLowerCase().includes('walletconnect')
        );
        
        if (walletConnectConnector) {
          await connect({ 
            connector: walletConnectConnector,
            chainId: CHAIN_ID 
          } as any);
          return;
        }
      }
      
      await connect({ 
        connector,
        chainId: CHAIN_ID 
      } as any);
    } catch (error) {
      console.error('Connection attempt failed:', error);
    }
  }, [connect, connectors, isMobile, isMetaMaskMobile]);

  // Ne pas afficher les boutons de connexion si déjà connecté
  if (isConnected) {
    return null;
  }

  return (
    <div className="container">
      <div className="set">
        {connectors.map((connector) => (
          <ConnectorButton
            key={connector.uid}
            connector={connector}
            onClick={() => handleConnect(connector)}
          />
        ))}
      </div>

      {isMobile && !isMetaMaskMobile && (
        <div className="mt-4 text-sm text-center text-gray-600">
          💡 Tip: Pour une meilleure expérience sur mobile, utilisez WalletConnect 
          ou ouvrez ce site dans une dApp browser comme MetaMask.
        </div>
      )}
    </div>
  );
}

function ConnectorButton({ connector, onClick }: ConnectorButtonProps) {
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    let mounted = true;

    async function checkProvider() {
      try {
        const provider = await connector.getProvider();
        if (mounted) {
          setReady(Boolean(provider));
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Provider check failed:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setReady(false);
        }
      }
    }
    
    checkProvider();
    
    return () => {
      mounted = false;
    };
  }, [connector]);

  const handleClick = React.useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!ready) return;
    onClick();
  }, [ready, onClick]);

  if (error) {
    return null;
  }

  return (
    <button
      disabled={!ready}
      onClick={handleClick}
      type="button"
      className="w-full sm:w-1/3 h-14 bg-gradient-to-r from-blue-500 to-blue-600 
                 text-white font-bold rounded-xl shadow-lg 
                 hover:from-blue-600 hover:to-blue-700 
                 hover:shadow-blue-200/50 hover:-translate-y-0.5 
                 transform transition-all disabled:opacity-50 
                 disabled:cursor-not-allowed disabled:hover:transform-none"
    >
      <div className="flex items-center justify-center gap-3">
        {getConnectorIcon(connector.name)}
        <span className="text-lg">
          {`Connect with ${connector.name}`}
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