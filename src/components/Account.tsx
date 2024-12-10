import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';
import { useCallback, useState } from 'react';
import KrillClaimButton from './KrillClaimButton';

interface AccountProps {
  myGames: boolean;
  onToggleMyGames: () => void;
}

export function Account({ myGames, onToggleMyGames }: AccountProps) {
  const { address, connector, isConnecting, isReconnecting, status } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName, isLoading: isEnsNameLoading } = useEnsName({ 
    address,
    chainId: 1 // ENS est sur Ethereum mainnet
  });
  const { data: ensAvatar, isLoading: isEnsAvatarLoading } = useEnsAvatar({ 
    name: ensName!,
    chainId: 1
  });

  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const formattedAddress = formatAddress(address);

  const handleDisconnect = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDisconnecting(true);
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      setIsDisconnecting(false);
    }
  }, [disconnect]);

  // Loading state
  if (isConnecting || isReconnecting) {
    return (
      <div className="account-container animate-pulse">
        <div className="account-row justify-center">
          <div className="text-gray-600 flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            Connecting...
          </div>
        </div>
      </div>
    );
  }

  // No address
  if (!address || status !== 'connected') return null;

  return (
    <div className="account-container">
      <div className="account-row">
        <div className="account-info">
          <div className="relative">
            {ensAvatar ? (
              <img 
                alt="ENS Avatar" 
                className="avatar transition-opacity duration-200"
                src={ensAvatar}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className={`avatar ${isEnsAvatarLoading ? 'animate-pulse' : ''}`} />
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div className="account-details">
            {address && (
              <div className="account-address">
                {isEnsNameLoading ? (
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <span className="font-medium">
                    {ensName ? `${ensName} (${formattedAddress})` : formattedAddress}
                  </span>
                )}
              </div>
            )}
            <div className="account-network text-sm text-gray-500">
              {connector?.name ? `Connected to ${connector.name}` : 'Connected'}
            </div>
          </div>
        </div>
        <div className="account-actions flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleMyGames();
            }}
            className={`
              my-games-button transform transition-all duration-200
              ${myGames ? 'active scale-105' : 'hover:scale-105'}
            `}
          >
            <span className="button-content flex items-center gap-2">
              <span className="text-lg">🎮</span>
              <span>My Games</span>
            </span>
          </button>

          <KrillClaimButton />
          
          <a
            href="https://t.me/WhaleintheBot"
            target="_blank"
            rel="noopener noreferrer"
            className="telegram-link"
          >
            <button className="back-button hover:scale-105 transform transition-all duration-200">
              <span className="button-content flex items-center gap-2">
                <span className="text-lg">💬</span>
                <span>Back to chat</span>
              </span>
            </button>
          </a>
          
          <button 
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className={`
              disconnect-button transform transition-all duration-200
              ${isDisconnecting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
            `}
          >
            <span className="button-content flex items-center gap-2">
              {isDisconnecting ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  <span className="text-lg">🔌</span>
                  <span>Disconnect</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function formatAddress(address?: string) {
  if (!address) return null;
  return `${address.slice(0, 6)}…${address.slice(38, 42)}`;
}