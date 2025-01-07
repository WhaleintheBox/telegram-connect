import { ReactNode, useState } from 'react';
import { Plus, Swords, ChevronDown, ChevronUp } from 'lucide-react';

// Import des images
import soccerImage from '../images/soccer.png';
import footballImage from '../images/football.png';
import basketballImage from '../images/basketball.png';
import tennisImage from '../images/tennis.png';
import f1Image from '../images/f1.png';
import mmaImage from '../images/mma.png';

interface NavigationTabsProps {
  children?: ReactNode;
}

type CellType = 'white' | 'purple' | 'blue' | 'yellow' | 'green' | 'red' | 'orange';

interface BoardCell {
  id: number;
  text: string;
  type: CellType;
}

const sports = [
  { id: 'football', emoji: '⚽', name: 'Football', image: soccerImage },
  { id: 'american-football', emoji: '🏈', name: 'American Football', image: footballImage },
  { id: 'basketball', emoji: '🏀', name: 'Basketball', image: basketballImage },
  { id: 'tennis', emoji: '🎾', name: 'Tennis', image: tennisImage },
  { id: 'f1', emoji: '🏎️', name: 'Formula 1', image: f1Image },
  { id: 'mma', emoji: '🥊', name: 'MMA', image: mmaImage }
];

const NavigationTabs: React.FC<NavigationTabsProps> = () => {
  const [isGridExpanded, setIsGridExpanded] = useState(false);
  const [selectedSport, setSelectedSport] = useState(sports[0].id);

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

  const createGridRows = () => {
    const rows: BoardCell[][] = [];
    let currentRow: BoardCell[] = [];
    
    boardCells.forEach((cell, index) => {
      currentRow.push(cell);
      if (currentRow.length === 5 || index === boardCells.length - 1) {
        if (rows.length % 2 === 1) {
          currentRow.reverse();
        }
        rows.push([...currentRow]);
        currentRow = [];
      }
    });
    
    return rows;
  };

  const renderArena = () => (
    <div className="center-area">
      <div className="center-content">
        <h2 className="center-title">
          🐳 WHALE IN THE BOX ARENA
        </h2>
        
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <button className="mint-button w-full flex flex-col items-center py-4 px-6 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪙</span>
              <span className="font-bold">MINT</span>
            </div>
            <span className="text-sm opacity-90">0.05 SOL for 3 NFTs</span>
          </button>
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
          <button className="fight-button">
            <Swords className="fight-icon" />
            FIGHT!
          </button>
        </div>

        <div className="sport-selection-container">
          <p className="section-label text-gray-600">Choose your Sport:</p>
          <div className="flex justify-center gap-4 my-4">
            <div className="sport-buttons-wrapper flex gap-4">
              {sports.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => setSelectedSport(sport.id)}
                  className={`sport-button ${selectedSport === sport.id ? 'sport-button-active' : ''}`}
                >
                  <span>{sport.emoji}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Sport Image */}
          <div className="sport-image-container">
            <img
              src={sports.find(s => s.id === selectedSport)?.image}
              alt={`${selectedSport} arena`}
              className="sport-image"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="board-wrapper">
      <div className="board-container">
        <div className="board-view">
          <button 
            className="toggle-button"
            onClick={() => setIsGridExpanded(!isGridExpanded)}
            aria-expanded={isGridExpanded}
            aria-label="Toggle progress board"
          >
            {isGridExpanded ? (
              <>
                <ChevronUp className="toggle-icon" />
                Hide Progress Board
              </>
            ) : (
              <>
                <ChevronDown className="toggle-icon" />
                Show Progress Board
              </>
            )}
          </button>

          <div className={`progress-grid ${isGridExpanded ? 'expanded' : ''}`}>
            {createGridRows().map((row, rowIndex) => (
              <div key={rowIndex} className="grid-row">
                {row.map((cell) => (
                  <div key={cell.id} className={`board-cell cell-${cell.type}`}>
                    <div className="cell-number">{cell.id}</div>
                    <div className="cell-text">{cell.text}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {renderArena()}
        </div>
      </div>
    </div>
  );
};

export default NavigationTabs;