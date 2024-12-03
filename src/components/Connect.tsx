// Connect.tsx
import * as React from 'react';
import { Connector, useConnect } from 'wagmi';

export function Connect() {
  const { connectors, connect } = useConnect();

  return (
    <div className="container">
      <div className="set">
        {connectors.map((connector) => (
          <ConnectorButton
            key={connector.uid}
            connector={connector}
            onClick={() => {
              // Sur mobile, forcer WalletConnect si ce n'est pas une dApp browser
              if (window.ethereum === undefined && 
                  connector.name.toLowerCase().includes('injected')) {
                const walletConnectConnector = connectors.find(c => 
                  c.name.toLowerCase().includes('walletconnect')
                );
                if (walletConnectConnector) {
                  connect({ connector: walletConnectConnector, chainId: 8453 });
                  return;
                }
              }
              connect({ connector, chainId: 8453 });
            }}
          />
        ))}
      </div>

      {/* Message d'aide pour mobile */}
      {window.ethereum === undefined && (
        <div className="mt-4 text-sm text-center text-gray-600">
          💡 Tip: Pour une meilleure expérience sur mobile, utilisez WalletConnect ou ouvrez ce site dans une dApp browser comme MetaMask.
        </div>
      )}
    </div>
  );
}

function ConnectorButton({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}) {
  const [ready, setReady] = React.useState(false);
  
  React.useEffect(() => {
    async function checkProvider() {
      try {
        const provider = await connector.getProvider();
        setReady(!!provider);
      } catch (error) {
        console.error('Error checking provider:', error);
        setReady(false);
      }
    }
    
    checkProvider();
  }, [connector]);

  return (
    <button
      disabled={!ready}
      onClick={onClick}
      type="button"
      className="w-full sm:w-1/3 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-200/50 hover:-translate-y-0.5 transform transition-all disabled:opacity-50"
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
  return '👛';
}