import { ReactNode } from 'react';
import { Plus, Swords, Coins } from 'lucide-react';

interface NavigationTabsProps {
  children: ReactNode;
}

type CellType = 'white' | 'purple' | 'blue' | 'yellow' | 'green' | 'red' | 'orange';

interface BoardCell {
  id: number;
  text: string;
  type: CellType;
}

const NavigationTabs: React.FC<NavigationTabsProps> = () => {
  const boardCells: BoardCell[] = [
    { id: 1, text: '🎁 Get 2 Free NFTs', type: 'white' },
    { id: 2, text: '🎯 Steal 1 NFT', type: 'purple' },
    { id: 3, text: '🎮 Play 5 Games', type: 'orange' },
    { id: 4, text: '💎 Steal 5 NFTs', type: 'purple' },
    { id: 5, text: '🏟️ Host 10 Matches', type: 'blue' },
    { id: 6, text: '⚽ Score 50 Goals', type: 'yellow' },
    { id: 7, text: '🌟 Power Up', type: 'green' },
    { id: 8, text: '⚔️ Battle Challenge', type: 'red' },
    { id: 9, text: '🏆 Host VIP Games', type: 'blue' },
    { id: 10, text: '💫 Steal 15 NFTs', type: 'purple' },
    { id: 11, text: '🎖️ Premier Host Games', type: 'blue' },
    { id: 12, text: '🎯 Score 100 Goals', type: 'yellow' },
    { id: 13, text: '✨ Rare NFT Quest', type: 'purple' },
    { id: 14, text: '🎲 Mystery Reward', type: 'white' },
    { id: 15, text: '👑 Legend: 100 Games', type: 'yellow' },
    { id: 16, text: '⭐ Elite Power Up', type: 'green' },
    { id: 17, text: '🔥 Ultimate Challenge', type: 'red' },
    { id: 18, text: '🏰 Host Championships', type: 'blue' },
    { id: 19, text: '⚡ Score Legend: 500', type: 'yellow' },
    { id: 20, text: '💎 NFT Master', type: 'purple' },
    { id: 21, text: '🎪 Special Event', type: 'white' },
    { id: 22, text: '🌈 Ultimate Power', type: 'green' },
    { id: 23, text: '⚔️ Master Challenge', type: 'red' },
    { id: 24, text: '🎁 Premium Reward', type: 'white' },
    { id: 25, text: '🏅 Elite NFT Quest', type: 'purple' },
    { id: 26, text: '🏆 1000 Goals Legend', type: 'yellow' },
    { id: 27, text: '🏟️ Tournament Master', type: 'blue' },
    { id: 28, text: '👑 NFT Champion', type: 'purple' },
    { id: 29, text: '🌟 Ultimate Host', type: 'blue' },
    { id: 30, text: '💫 Epic NFT Master', type: 'purple' }
  ];

  return (
    <div className="board-wrapper">
      <div className="board-container">
        <div className="board-grid">
          {/* Top row */}
          {boardCells.slice(0, 7).map((cell) => (
            <div key={cell.id} className={`board-cell cell-${cell.type}`}>
              {cell.text}
            </div>
          ))}
          
          {/* Center section */}
          <div className="center-section">
            {/* Left side */}
            <div className="side-cells">
              {boardCells.slice(22, 30).reverse().map((cell) => (
                <div key={cell.id} className={`board-cell cell-${cell.type}`}>
                  {cell.text}
                </div>
              ))}
            </div>

            {/* Center area */}
            <div className="center-area">
              <div className="center-content">
                <h2 className="center-title">🐳 WHALE IN THE BOX ARENA</h2>
                
                <div className="nft-price">
                  <Coins className="coin-icon" />
                  <span>0.05 SOL for 3 NFTs</span>
                </div>
                
                <div className="players-section">
                  <p className="section-label">🏃‍♂️ Select Your Team (5 Players)</p>
                  <div className="player-slots">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="player-slot">
                        <Plus className="plus-icon" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="stadium-section">
                  <p className="section-label">🏟️ Choose Your Stadium</p>
                  <div className="stadium-slot">
                    <Plus className="plus-icon" />
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="mint-button">
                    🪙 MINT NFT
                  </button>
                  <button className="fight-button">
                    <Swords className="fight-icon" />
                    FIGHT!
                  </button>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="side-cells">
              {boardCells.slice(7, 15).map((cell) => (
                <div key={cell.id} className={`board-cell cell-${cell.type}`}>
                  {cell.text}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          {boardCells.slice(15, 22).reverse().map((cell) => (
            <div key={cell.id} className={`board-cell cell-${cell.type}`}>
              {cell.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationTabs;