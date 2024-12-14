import { useAppKitState } from '@reown/appkit/react';

interface Stats {
  totalPlayers: number;
  activeBoxes: number;
  ethVolume: number;
  krillVolume: number;
  otherTokensVolume: number;
}

interface ExtendedAppKitState {
  stats?: Stats;
}

export function StatsPanel() {
  const state = useAppKitState() as ExtendedAppKitState;
  const stats = state.stats || {
    totalPlayers: 0,
    activeBoxes: 0,
    ethVolume: 0,
    krillVolume: 0,
    otherTokensVolume: 0
  };

  return (
    <div className="stats-container">
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">🐳 Whales</span>
          <span className="stat-value">{stats.totalPlayers}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">📦 Active Boxes</span>
          <span className="stat-value">{stats.activeBoxes}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">💎 ETH Volume</span>
          <span className="stat-value">{Number(stats.ethVolume).toFixed(2)} ETH</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">🍤 KRILL Volume</span>
          <span className="stat-value">{Number(stats.krillVolume).toFixed(2)} KRILL</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">🪙 Other Tokens</span>
          <span className="stat-value">${Number(stats.otherTokensVolume).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
