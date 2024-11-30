// Connect.tsx
import * as React from 'react';
import { Connector, useChainId, useConnect } from 'wagmi';

export function Connect() {
  const chainId = useChainId();
  const { connectors, connect } = useConnect();

  return (
    <div className="container">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Connect Wallet</h2>
      <div className="set">
        {connectors.map((connector) => (
          <ConnectorButton
            key={connector.uid}
            connector={connector}
            onClick={() => connect({ connector, chainId })}
          />
        ))}
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
      className={`w-full flex items-center justify-center ${!ready && 'opacity-50 cursor-not-allowed'}`}
    >
      {ready ? (
        `Connect with ${connector.name}`
      ) : (
        <span className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      )}
    </button>
  );
}