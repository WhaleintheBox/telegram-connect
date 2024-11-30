import * as React from 'react';
import { Connector, useChainId, useConnect } from 'wagmi';

export function Connect() {
  const chainId = useChainId();
  const { connectors, connect } = useConnect();

  return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Connect Your Wallet
        </h2>
        <div className="space-y-4">
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
        w-full px-6 py-4 rounded-xl font-medium text-base
        transition-all duration-200 ease-in-out
        flex items-center justify-center
        ${ready 
          ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800' 
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }
      `}
    >
      {ready ? (
        `Connect to ${connector.name}`
      ) : (
        <span className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading {connector.name}...
        </span>
      )}
    </button>
  );
}