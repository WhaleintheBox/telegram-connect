// Connect.tsx
import * as React from 'react';
import { Connector, useChainId, useConnect } from 'wagmi';

export function Connect() {
  const chainId = useChainId();
  const { connectors, connect } = useConnect();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
          Connect Wallet
        </h2>
        <div className="space-y-3">
          {connectors.map((connector) => (
            <ConnectorButton
              key={connector.uid}
              connector={connector}
              onClick={() => connect({ connector, chainId })}
            />
          ))}
        </div>
      </div>
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
    (async () => {
      try {
        const provider = await connector.getProvider();
        setReady(!!provider);
      } catch (error) {
        console.error('Error getting provider:', error);
        setReady(false);
      }
    })();
  }, [connector]);

  return (
    <button
      disabled={!ready}
      onClick={onClick}
      type="button"
      className={`
        w-full px-6 py-3 rounded-lg font-medium text-sm
        transition-colors duration-200
        ${ready 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }
      `}
    >
      {ready ? (
        `Connect with ${connector.name}`
      ) : (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      )}
    </button>
  );
}