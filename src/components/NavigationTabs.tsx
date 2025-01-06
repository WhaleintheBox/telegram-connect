import { ReactNode } from 'react';
import { useState } from 'react';
import { Plus } from 'lucide-react';

interface NavigationTabsProps {
  children: ReactNode;
}

type CellType = 'white' | 'purple' | 'blue' | 'yellow' | 'green' | 'red' | 'orange';

interface BoardCell {
  id: number;
  text: string;
  type: CellType;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'betting' | 'nft'>('betting');
  
  const boardCells: BoardCell[] = [
    { id: 1, text: 'Receive 2 NFT Rewards', type: 'white' },
    { id: 2, text: 'Challenge: Acquire 1 NFT', type: 'purple' },
    { id: 3, text: 'Complete 5 Matches', type: 'orange' },
    { id: 4, text: 'Challenge: Acquire 5 NFTs', type: 'purple' },
    { id: 5, text: 'Host 10 Home Games', type: 'blue' },
    { id: 6, text: 'Score 50 Goals Achievement', type: 'yellow' },
    { id: 7, text: 'Power Up: Bonus Reward', type: 'green' },
    { id: 8, text: 'Challenge: Overcome Setback', type: 'red' },
    { id: 9, text: 'Host 20 Elite Matches', type: 'blue' },
    { id: 10, text: 'Master NFT Challenge: Acquire 15', type: 'purple' },
    { id: 11, text: 'Premier Host: 20 Home Games', type: 'blue' },
    { id: 12, text: 'Century Goals Achievement', type: 'yellow' },
    { id: 13, text: 'Rare NFT Challenge', type: 'purple' },
    { id: 14, text: 'Mystery Reward Opportunity', type: 'white' },
    { id: 15, text: 'Legend Status: 100 Games', type: 'yellow' },
    { id: 16, text: 'Power Up: Elite Bonus', type: 'green' },
    { id: 17, text: 'Strategic Challenge', type: 'red' },
    { id: 18, text: 'Host 50 Championship Games', type: 'blue' },
    { id: 19, text: 'Goal Scoring Legend: 500', type: 'yellow' },
    { id: 20, text: 'NFT Master: Acquire 50', type: 'purple' },
    { id: 21, text: 'Special Event Space', type: 'white' },
    { id: 22, text: 'Power Up: Ultimate Reward', type: 'green' },
    { id: 23, text: 'Ultimate Challenge', type: 'red' },
    { id: 24, text: 'Premium Reward Space', type: 'white' },
    { id: 25, text: 'Elite NFT Challenge', type: 'purple' },
    { id: 26, text: 'Legendary 1000 Goals', type: 'yellow' },
    { id: 27, text: 'Home Game Master: 200', type: 'blue' },
    { id: 28, text: 'NFT Champion: Acquire 100', type: 'purple' },
    { id: 29, text: 'Ultimate Host: 500 Games', type: 'blue' },
    { id: 30, text: 'Epic NFT Master Challenge', type: 'purple' }
  ];

  const colorClasses: Record<CellType, string> = {
    white: 'cell-white',
    purple: 'cell-purple',
    blue: 'cell-blue',
    yellow: 'cell-yellow',
    green: 'cell-green',
    red: 'cell-red',
    orange: 'cell-orange'
  };

  const GameBoard = () => {
    return (
      <div className="board-wrapper">
        <div className="board-container">
          <div className="board-grid">
            {/* Top row */}
            {boardCells.slice(0, 7).map((cell) => (
              <div key={cell.id} className={`board-cell ${colorClasses[cell.type]}`}>
                {cell.text}
              </div>
            ))}
            
            {/* Center section */}
            <div className="center-section">
              {/* Left side */}
              <div className="side-cells">
                {boardCells.slice(22, 30).reverse().map((cell) => (
                  <div key={cell.id} className={`board-cell ${colorClasses[cell.type]}`}>
                    {cell.text}
                  </div>
                ))}
              </div>

              {/* Center area */}
              <div className="center-area">
                <div className="center-content">
                  <h2 className="center-title">SPORTS NFT ARENA</h2>
                  
                  {/* Players area */}
                  <div className="players-section">
                    <p className="section-label">Place Your 5 Player Cards</p>
                    <div className="player-slots">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="player-slot">
                          <Plus className="plus-icon" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stadium area */}
                  <div className="stadium-section">
                    <p className="section-label">Place Your Stadium Card</p>
                    <div className="stadium-slot">
                      <Plus className="plus-icon" />
                    </div>
                  </div>

                  {/* Mint button */}
                  <button className="mint-button">
                    MINT NFT
                  </button>
                </div>
              </div>

              {/* Right side */}
              <div className="side-cells">
                {boardCells.slice(7, 15).map((cell) => (
                  <div key={cell.id} className={`board-cell ${colorClasses[cell.type]}`}>
                    {cell.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom row */}
            {boardCells.slice(15, 22).reverse().map((cell) => (
              <div key={cell.id} className={`board-cell ${colorClasses[cell.type]}`}>
                {cell.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <button
          onClick={() => setActiveTab('betting')}
          className={`tab-button ${activeTab === 'betting' ? 'active' : ''}`}
        >
          Betting
        </button>
        <button
          onClick={() => setActiveTab('nft')}
          className={`tab-button ${activeTab === 'nft' ? 'active' : ''}`}
        >
          NFT
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'betting' ? children : <GameBoard />}
      </div>
    </div>
  );
};

export default NavigationTabs;