import { ReactNode, useState } from 'react';

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
    // Première ligne (1-7)
    { id: 1, text: 'Get 2 free NFT each turn', type: 'white' },
    { id: 2, text: 'Rob 1 NFT', type: 'purple' },
    { id: 3, text: 'Do 5 games', type: 'orange' },
    { id: 4, text: 'Rob 5 NFT', type: 'purple' },
    { id: 5, text: 'Play 10 times Home', type: 'blue' },
    { id: 6, text: 'Score 50 goals', type: 'yellow' },
    { id: 7, text: 'BONUS CARD', type: 'green' },
    // Côté droit (8-15)
    { id: 8, text: 'MALUS CARD', type: 'red' },
    { id: 9, text: 'Play 20 games Home', type: 'blue' },
    { id: 10, text: 'Rob 15 NFT', type: 'purple' },
    { id: 11, text: 'Play 20 times home', type: 'blue' },
    { id: 12, text: 'Score 100 goals', type: 'yellow' },
    { id: 13, text: 'Rob a Rare NFT in our last 5 games', type: 'purple' },
    { id: 14, text: 'Just a Chill Case Magic can happen some days', type: 'white' },
    { id: 15, text: 'Play 100 Games', type: 'yellow' },
    // Ligne du bas (16-22)
    { id: 16, text: 'BONUS CARD', type: 'green' },
    { id: 17, text: 'MALUS CARD', type: 'red' },
    { id: 18, text: 'Play 50 times home', type: 'blue' },
    { id: 19, text: 'Score 500 goals', type: 'yellow' },
    { id: 20, text: 'Rob 50 NFT', type: 'purple' },
    { id: 21, text: 'Just a Chill Case Magic can happen some days', type: 'white' },
    { id: 22, text: 'BONUS CARD', type: 'green' },
    // Côté gauche (23-30)
    { id: 23, text: 'MALUS CARD', type: 'red' },
    { id: 24, text: 'Just a Chill Case Magic can happen some days', type: 'white' },
    { id: 25, text: 'Rob a Rare NFT in our last 5 games', type: 'purple' },
    { id: 26, text: 'Score 1000 goals', type: 'yellow' },
    { id: 27, text: 'Play 200 times home', type: 'blue' },
    { id: 28, text: 'Rob 100 NFT', type: 'purple' },
    { id: 29, text: 'Play 500 games Home', type: 'blue' },
    { id: 30, text: 'Rob an Epic NFT in our last 5 games or 3 rare in our last 10 games', type: 'purple' }
  ];

  const bonusCards = [
    'BONUS CARD +2 case',
    'BONUS CARD +2 case',
    'BONUS CARD +3 case',
    'BONUS CARD +3 case',
    'BONUS CARD +4 case',
    'BONUS CARD Get One Free NFT+2 case',
    'BONUS CARD',
    'BONUS CARD'
  ];

  const malusCards = [
    'MALUS CARD -3 case',
    'MALUS CARD -3 case',
    'MALUS CARD -3 case',
    'MALUS CARD -2 cases',
    'MALUS CARD -2 case',
    'MALUS CARD -2 case',
    'MALUS CARD -1 case',
    'MALUS CARD -5 case'
  ];

  const GameBoard = () => {
    return (
      <div className="board-container">
        <div className="board">
          {/* Première ligne */}
          {boardCells.slice(0, 7).map((cell) => (
            <div
              key={cell.id}
              className={`board-cell cell-${cell.type}`}
            >
              {cell.text}
            </div>
          ))}

          {/* Section centrale */}
          <div className="board-center">
            {/* Colonne gauche */}
            <div className="side-cells">
              {boardCells.slice(22, 30).reverse().map((cell) => (
                <div
                  key={cell.id}
                  className={`board-cell cell-${cell.type}`}
                >
                  {cell.text}
                </div>
              ))}
            </div>

            {/* Zone centrale */}
            <div className="center-zone">
              <div className="center-text">
                <h2 className="center-title">ADD MY NFT AND FIND A FIGHT</h2>
                <p>Make your CARD DESK and choose a sports</p>
                <p>Football / American Football / Tennis / MMA</p>
                <p>Au début mise en place de bot</p>
              </div>

              {/* Cartes bonus */}
              <div className="cards-grid">
                {bonusCards.map((card, index) => (
                  <div key={`bonus-${index}`} className="bonus-card">
                    {card}
                  </div>
                ))}
              </div>

              {/* Cartes malus */}
              <div className="cards-grid">
                {malusCards.map((card, index) => (
                  <div key={`malus-${index}`} className="malus-card">
                    {card}
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne droite */}
            <div className="side-cells">
              {boardCells.slice(7, 15).map((cell) => (
                <div
                  key={cell.id}
                  className={`board-cell cell-${cell.type}`}
                >
                  {cell.text}
                </div>
              ))}
            </div>
          </div>

          {/* Dernière ligne */}
          {boardCells.slice(15, 22).reverse().map((cell) => (
            <div
              key={cell.id}
              className={`board-cell cell-${cell.type}`}
            >
              {cell.text}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="navigation-container">
      {/* Navigation */}
      <div className="navigation-tabs">
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

      {/* Contenu */}
      <div className="tab-content">
        {activeTab === 'betting' ? children : <GameBoard />}
      </div>
    </div>
  );
};

export default NavigationTabs;