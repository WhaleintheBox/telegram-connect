import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';
import KrillClaimButton from './KrillClaimButton';

interface AccountProps {
  botName: string;
  myGames: boolean;
  onToggleMyGames: () => void;
}

export function Account({ myGames, onToggleMyGames }: AccountProps) {
  const { address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  const formattedAddress = formatAddress(address);

  return (
    <div className="account-container">
      <div className="account-row">
        <div className="account-info">
          {ensAvatar ? (
            <img alt="ENS Avatar" className="avatar" src={ensAvatar} />
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
              Connected to {connector?.name}
            </div>
          </div>
        </div>
        <div className="account-actions">
          {/* Bouton My Games */}
          <button
            onClick={onToggleMyGames}
            className={`my-games-button ${myGames ? 'active' : ''}`}
          >
            🎮 My Games
          </button>

          {/* Bouton de claim KRILL */}
          <KrillClaimButton />
          
          {/* Bouton retour vers Telegram */}
          <a
            href={`https://t.me/WhaleintheBot`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="back-button">
              Back to chat
            </button>
          </a>
          
          {/* Bouton de déconnexion */}
          <button onClick={() => disconnect()} className="disconnect-button">
            Disconnect
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