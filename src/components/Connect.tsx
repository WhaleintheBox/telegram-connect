import * as React from 'react';
import { Connector, useConnect } from 'wagmi';

export function Connect() {
  const { connectors, connect, isPending } = useConnect();

  return (
    <div className="container">
      <div className="grid grid-cols-1 gap-4 p-4">
        {connectors.map((connector) => (
          <ConnectorButton
            key={connector.uid}
            connector={connector}
            onClick={() => connect({ connector, chainId: 8453 })} // Force Base chain
            isLoading={isPending}
          />
        ))}
      </div>
    </div>
  );
}

interface ConnectorButtonProps {
  connector: Connector;
  onClick: () => void;
  isLoading?: boolean;
}

function ConnectorButton({
  connector,
  onClick,
  isLoading
}: ConnectorButtonProps) {
  const [ready, setReady] = React.useState(false);
  
  React.useEffect(() => {
    async function checkProvider() {
      try {
        const provider = await connector.getProvider();
        setReady(!!provider);
      } catch (error) {
        console.error('Error getting provider:', error);
        setReady(false);
      }
    }

    checkProvider();
  }, [connector]);

  return (
    <button
      disabled={!ready || isLoading}
      onClick={onClick}
      type="button"
      className="w-full px-6 py-4 text-lg font-semibold text-white rounded-xl transition-all transform hover:-translate-y-0.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
    >
      <div className="flex items-center justify-center gap-3">
        {getConnectorIcon(connector.name)}
        <span>
          {isLoading ? 'Connecting...' : `Connect with ${connector.name}`}
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