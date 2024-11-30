import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';

export function Account(props: { botName: string }) {
  const { address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  const formattedAddress = formatAddress(address);

  return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Avatar */}
            {ensAvatar ? (
              <img 
                alt="ENS Avatar" 
                src={ensAvatar} 
                className="w-16 h-16 rounded-full border-2 border-gray-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200" />
            )}
            
            {/* Address Info */}
            <div className="flex flex-col items-center sm:items-start">
              {address && (
                <div className="font-medium text-gray-900 text-lg">
                  {ensName ? `${ensName} (${formattedAddress})` : formattedAddress}
                </div>
              )}
              <div className="text-sm text-gray-500 mt-1">
                Connected to {connector?.name}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <a 
              href={`https://t.me/${props.botName}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <button className="w-full px-6 py-3 bg-white text-gray-900 rounded-xl border-2 border-gray-200 hover:bg-gray-50 font-medium transition-colors">
                Back to Chat
              </button>
            </a>
            <button 
              className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors"
              onClick={() => disconnect()} 
              type="button"
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