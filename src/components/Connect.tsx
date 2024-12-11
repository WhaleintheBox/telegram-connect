import * as React from 'react';
import { Connector, useConnect, useAccount } from 'wagmi';
import { useSDK } from '@metamask/sdk-react';

type ConnectorButtonProps = {
  connector: Connector;
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

  const isIOS = React.useMemo(() => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  const hasMetaMaskProvider = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.ethereum?.isMetaMask);
  }, []);

  // Error handling with retries for mobile
  React.useEffect(() => {
    if (connectError) {
      console.error('Connection error:', connectError);
      setConnectionInProgress(null);
      
      const errorMessage = connectError.message || 'Connection failed';
      if (errorMessage.includes('user rejected')) {
        alert('Connection rejected. Please try again.');
      } else if (errorMessage.includes('network')) {
        alert('Network error. Please check your connection and try again.');
      } else {
        // For mobile users, provide more specific guidance
        if (isMobile) {
          alert('Please make sure MetaMask is installed and you are using its in-app browser. If you were redirected, please try connecting again.');
        } else {
          alert('Connection failed. Please try again or use a different wallet.');
        }
      }
    }
  }, [connectError, isMobile]);

  const handleConnect = React.useCallback(async (connector: Connector) => {
    try {
      setConnectionInProgress(connector.uid);
      const connectorName = connector.name.toLowerCase();

      if (isMobile && connectorName.includes('metamask')) {
        if (hasMetaMaskProvider) {
          // Direct connection if we're in MetaMask's browser
          await connect({ connector });
        } else {
          // Handle mobile browser scenario
          try {
            if (sdk) {
              // Try SDK first
              await sdk.connect();
              await connect({ connector });
            } else {
              // Fallback to deep linking with return URL
              const currentURL = encodeURIComponent(window.location.href);
              const host = window.location.host;
              const pathname = window.location.pathname;
              
              // Include return URL in the deep link
              const universalLink = `https://metamask.app.link/dapp/${host}${pathname}?returnUrl=${currentURL}`;
              const protocolLink = `metamask://dapp/${host}${pathname}?returnUrl=${currentURL}`;

              // Store connection attempt in sessionStorage
              sessionStorage.setItem('metamaskConnectionPending', 'true');

              if (isIOS) {
                window.location.href = universalLink;
              } else {
                // For Android, try protocol first then fallback
                window.location.href = protocolLink;
                setTimeout(() => {
                  if (!document.hidden) {
                    window.location.href = universalLink;
                  }
                }, 1500);
              }
            }
          } catch (error) {
            console.error('MetaMask connection error:', error);
            throw error;
          }
          return;
        }
      } else {
        await connect({ connector });
      }
    } catch (error) {
      console.error('Connection attempt failed:', error);
      throw error;
    } finally {
      setConnectionInProgress(null);
    }
  }, [connect, isMobile, hasMetaMaskProvider, sdk, isIOS]);

  // Check for pending connections on return from MetaMask
  React.useEffect(() => {
    const checkPendingConnection = async () => {
      const isPending = sessionStorage.getItem('metamaskConnectionPending');
      if (isPending && window.ethereum?.isMetaMask) {
        sessionStorage.removeItem('metamaskConnectionPending');
        const metamaskConnector = connectors.find(c => 
          c.name.toLowerCase().includes('metamask')
        );
        if (metamaskConnector) {
          try {
            await connect({ connector: metamaskConnector });
          } catch (error) {
            console.error('Auto-reconnect failed:', error);
          }
        }
      }
    };

    checkPendingConnection();
  }, [connect, connectors]);

  if (isConnected) {
    return null;
  }

  const availableConnectors = connectors.filter(connector => {
    const name = connector.name.toLowerCase();
    if (isMobile && !hasMetaMaskProvider && name.includes('metamask')) {
      return true; // Always show MetaMask option on mobile
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
              💡 Connection Tips:
              <ul className="mt-2 space-y-1 text-left">
                <li>• Install MetaMask if not already installed</li>
                <li>• After redirecting to MetaMask, connect in the MetaMask app</li>
                <li>• Return to this page to complete the connection</li>
                <li>• If connection fails, try WalletConnect as an alternative</li>
              </ul>
            </>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🦊 Using MetaMask browser
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
    return () => { mounted = false; };
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