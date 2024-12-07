import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';
import KrillClaimButton from './KrillClaimButton';

interface AccountProps {
  myGames: boolean;
  onToggleMyGames: () => void;
}

export function Account({ myGames, onToggleMyGames }: AccountProps) {
  const { address, connector, isConnecting, isReconnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });
  const formattedAddress = formatAddress(address);

  if (isConnecting || isReconnecting) {
    return (
      <div className="account-container">
        <div className="account-row justify-center">
          <div className="text-gray-600">
            Connecting...
          </div>
        </div>
      </div>
    );
  }

  // Ne rien afficher si pas d'adresse
  if (!address) return null;

  return (
    <div className="account-container">
      <div className="account-row">
        <div className="account-info">
          {ensAvatar ? (
            <img 
              alt="ENS Avatar" 
              className="avatar" 
              src={ensAvatar}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="avatar" />
          )}
          <div className="account-details">
            {address && (
              <div className="account-address">
                {ensName ? `${ensName} (${formattedAddress})` : formattedAddress}
              </div>
            )}
            <div className="account-network">
              {connector?.name ? `Connected to ${connector.name}` : 'Connected'}
            </div>
          </div>
        </div>
        <div className="account-actions">
          {/* Bouton My Games */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleMyGames();
            }}
            className={`my-games-button ${myGames ? 'active' : ''}`}
          >
            <span className="button-content">🎮 My Games</span>
          </button>

          {/* Bouton de claim KRILL */}
          <KrillClaimButton />
          
          {/* Bouton retour vers Telegram */}
          <a
            href={`https://t.me/WhaleintheBot`}
            target="_blank"
            rel="noopener noreferrer"
            className="telegram-link"
          >
            <button className="back-button">
              <span className="button-content">Back to chat</span>
            </button>
          </a>
          
          {/* Bouton de déconnexion */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              disconnect();
            }} 
            className="disconnect-button"
          >
            <span className="button-content">Disconnect</span>
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