// Account.tsx
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';

export function Account(props: { botName: string }) {
  const { address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  const formattedAddress = formatAddress(address);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            {ensAvatar ? (
              <img 
                alt="ENS Avatar" 
                src={ensAvatar} 
                className="w-12 h-12 rounded-full bg-gray-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100" />
            )}
            <div>
              {address && (
                <div className="font-medium text-gray-900">
                  {ensName ? `${ensName} (${formattedAddress})` : formattedAddress}
                </div>
              )}
              <div className="text-sm text-gray-500">
                Connected to {connector?.name}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href={`https://t.me/${props.botName}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <button className="w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Back to Chat
              </button>
            </a>
            <button 
              onClick={() => disconnect()} 
              type="button"
              className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatAddress(address?: string) {
  if (!address) return null;
  return `${address.slice(0, 6)}…${address.slice(38, 42)}`;
}