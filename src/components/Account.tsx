'use client';

import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';
import { useCallback, useState, useMemo, useEffect } from 'react';
import KrillClaimButton from './KrillClaimButton';

interface AccountProps {
  myGames: boolean;
  onToggleMyGames: () => void;
}

function formatAddress(address?: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function Account({ myGames, onToggleMyGames }: AccountProps) {
  const { address, connector, isConnecting, isReconnecting, status } = useAccount();
  const { disconnect } = useDisconnect();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [uid, setUid] = useState<string>("");
  const [callbackEndpoint, setCallbackEndpoint] = useState<string>("");
  const [hasNotifiedConnection, setHasNotifiedConnection] = useState(false);

  const { data: ensName, isLoading: isEnsNameLoading } = useEnsName({
    address,
    chainId: 1,
  });

  const { data: ensAvatar, isLoading: isEnsAvatarLoading } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: 1,
  });

  const formattedAddress = useMemo(() => formatAddress(address), [address]);

  // Get URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUid(params.get("uid") || "");
    setCallbackEndpoint(params.get("callback") || "");
  }, []);

  // Handle wallet connection notification
  useEffect(() => {
    const notifyConnection = async () => {
      if (address && uid && callbackEndpoint && !hasNotifiedConnection) {
        try {
          const connectionData = {
            type: 'connect_wallet',
            address: address,
            connect: true
          };

          const response = await fetch(callbackEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...connectionData,
              uid
            }),
          });

          if (response.ok) {
            setHasNotifiedConnection(true);
            console.log('Successfully notified bot of wallet connection');
          } else {
            console.error('Failed to notify bot:', await response.text());
          }
        } catch (error) {
          console.error('Error notifying bot of connection:', error);
        }
      }
    };

    notifyConnection();
  }, [address, uid, callbackEndpoint, hasNotifiedConnection]);

  const handleDisconnect = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDisconnecting) return;

    setIsDisconnecting(true);
    try {
      await disconnect();
      setHasNotifiedConnection(false); // Reset notification state on disconnect
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      setIsDisconnecting(false);
    }
  }, [disconnect, isDisconnecting]);

  const handleMyGamesClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onToggleMyGames();
  }, [onToggleMyGames]);

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

  // No address or not connected
  if (!address || status !== 'connected') return null;

  return (
    <div className="account-container">
      <div className="account-row">
        <div className="account-info">
          <div className="relative">
            {ensAvatar ? (
              <img 
                alt={ensName || 'ENS Avatar'} 
                className="avatar transition-opacity duration-200"
                src={ensAvatar}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.opacity = '0';
                  setTimeout(() => {
                    target.style.display = 'none';
                  }, 200);
                }}
              />
            ) : (
              <div 
                className={`avatar ${isEnsAvatarLoading ? 'animate-pulse bg-gray-200' : 'bg-blue-100'}`}
                role="img"
                aria-label="Default Avatar"
              />
            )}
            <div 
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"
              role="status"
              aria-label="Connected"
            />
          </div>
          <div className="account-details">
            <div className="account-address">
              {isEnsNameLoading ? (
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              ) : (
                <span className="font-medium">
                  {ensName ? `${ensName} (${formattedAddress})` : formattedAddress}
                </span>
              )}
            </div>
            <div className="account-network text-sm text-gray-500">
              {connector?.name ? `Connected to ${connector.name}` : 'Connected'}
            </div>
          </div>
        </div>
        <div className="account-actions flex items-center gap-2">
          <button
            onClick={handleMyGamesClick}
            className={`
              my-games-button transform transition-all duration-200
              ${myGames ? 'active scale-105' : 'hover:scale-105'}
            `}
            aria-pressed={myGames}
          >
            <span className="button-content flex items-center gap-2">
              <span className="text-lg" role="img" aria-label="Games">🎮</span>
              <span>My Games</span>
            </span>
          </button>

          <KrillClaimButton />
          
          <a
            href="https://t.me/WhaleintheBot"
            target="_blank"
            rel="noopener noreferrer"
            className="telegram-link"
            aria-label="Return to Telegram chat"
          >
            <button className="back-button hover:scale-105 transform transition-all duration-200">
              <span className="button-content flex items-center gap-2">
                <span className="text-lg" role="img" aria-label="Chat">💬</span>
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
            aria-busy={isDisconnecting}
          >
            <span className="button-content flex items-center gap-2">
              {isDisconnecting ? (
                <span className="animate-spin" aria-hidden="true">⏳</span>
              ) : (
                <>
                  <span className="text-lg" role="img" aria-label="Disconnect">🔌</span>
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