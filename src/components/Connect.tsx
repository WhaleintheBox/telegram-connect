import * as React from 'react';
import { Connector, useConnect, useAccount } from 'wagmi';

// Constants
const CHAIN_ID = 8453; // Base chain
const METAMASK_DEEP_LINK = 'https://metamask.app.link/dapp/';
const CONNECTION_TIMEOUT = 30000;

// Types
type ConnectorButtonProps = {
  connector: Connector;
  onClick: () => void;
  isPending?: boolean;
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

const getMetaMaskProvider = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const provider = window.ethereum;
    return Boolean(provider?.isMetaMask);
  } catch {
    return false;
  }
};

export function Connect() {
  const { connectors, connect, error: connectError, status } = useConnect();
  const { isConnected } = useAccount();
  const [connectionInProgress, setConnectionInProgress] = React.useState<string | null>(null);
  const [lastAttemptedConnector, setLastAttemptedConnector] = React.useState<string | null>(null);

  const isMobile = React.useMemo(detectMobile, []);
  const hasMetaMaskProvider = React.useMemo(getMetaMaskProvider, []);

  // Auto-connect after MetaMask redirection
  React.useEffect(() => {
    const attemptAutoConnect = async () => {
      if (hasMetaMaskProvider && !isConnected && lastAttemptedConnector) {
        const connector = connectors.find(c => c.uid === lastAttemptedConnector);
        if (connector) {
          try {
            await connect({ 
              connector,
              chainId: CHAIN_ID 
            });
          } catch (error: unknown) {
            console.error('Auto-connect failed:', error);
          }
        }
      }
    };

    attemptAutoConnect();
  }, [hasMetaMaskProvider, isConnected, lastAttemptedConnector, connectors, connect]);

  // Error handling
  React.useEffect(() => {
    if (connectError) {
      console.error('Connection error:', connectError);
      setConnectionInProgress(null);
      
      const errorMessage = connectError.message || 'Connection failed';
      if (errorMessage.includes('user rejected')) {
        alert('Connection rejected. Please try again.');
      } else if (errorMessage.includes('network')) {
        alert('Network error. Please check your connection and try again.');
      } else if (errorMessage.includes('timeout')) {
        alert('Connection timed out. Please try again.');
      } else {
        alert('Connection failed. Please try again or use a different wallet.');
      }
    }
  }, [connectError]);

  const handleConnect = React.useCallback(async (connector: Connector) => {
    try {
      setConnectionInProgress(connector.uid);
      setLastAttemptedConnector(connector.uid);
      
      const connectorName = connector.name.toLowerCase();
      
      // MetaMask Mobile handling
      if (isMobile && (connectorName.includes('metamask') || connectorName.includes('injected'))) {
        if (!hasMetaMaskProvider) {
          const currentUrl = window.location.href;
          const encodedUrl = encodeURIComponent(currentUrl);
          const deepLink = `${METAMASK_DEEP_LINK}${encodedUrl}`;
          
          // Store the connector info for auto-connect after redirect
          localStorage.setItem('lastConnector', connector.uid);
          
          // Redirect to MetaMask
          window.location.href = deepLink;
          return;
        }
      }

      // WalletConnect handling on mobile
      if (isMobile && !hasMetaMaskProvider && connectorName.includes('injected')) {
        const walletConnectConnector = connectors.find(c => 
          c.name.toLowerCase().includes('walletconnect')
        );
        
        if (walletConnectConnector) {
          const connectPromise = connect({ 
            connector: walletConnectConnector,
            chainId: CHAIN_ID 
          });
          
          await Promise.race([
            connectPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT))
          ]);
          
          return;
        }
      }

      // Standard connection
      await Promise.race([
        connect({ connector, chainId: CHAIN_ID }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT))
      ]);

    } catch (error: unknown) {
      console.error('Connection attempt failed:', error);
      throw error;
    } finally {
      setConnectionInProgress(null);
    }
  }, [connect, connectors, isMobile, hasMetaMaskProvider]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      setConnectionInProgress(null);
      setLastAttemptedConnector(null);
    };
  }, []);

  if (isConnected) {
    return null;
  }

  const availableConnectors = connectors.filter(connector => {
    const name = connector.name.toLowerCase();
    // Filter out MetaMask on mobile when not available
    if (isMobile && !hasMetaMaskProvider && name.includes('metamask')) {
      return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">
        {availableConnectors.map((connector) => (
          <ConnectorButton
            key={connector.uid}
            connector={connector}
            onClick={() => handleConnect(connector)}
            isPending={connectionInProgress === connector.uid || status === 'pending'}
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

function ConnectorButton({ connector, onClick, isPending }: ConnectorButtonProps) {
  const [ready, setReady] = React.useState(false);
  
  React.useEffect(() => {
    let mounted = true;

    async function checkProvider() {
      try {
        const provider = await connector.getProvider();
        if (mounted) {
          setReady(Boolean(provider));
        }
      } catch (err) {
        console.error('Provider check failed:', err);
        if (mounted) {
          setReady(false);
        }
      }
    }
    
    checkProvider();
    
    return () => {
      mounted = false;
    };
  }, [connector]);

  return (
    <button
      disabled={!ready || isPending}
      onClick={(e) => {
        e.preventDefault();
        if (!ready || isPending) return;
        onClick();
      }}
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
          getConnectorIcon(connector.name)
        )}
        <span className="text-lg">
          {isPending ? 'Connecting...' : `Connect with ${connector.name}`}
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