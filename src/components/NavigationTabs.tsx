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
    // Ligne du bas (16-22) - inversée pour le rendu
    { id: 16, text: 'BONUS CARD', type: 'green' },
    { id: 17, text: 'MALUS CARD', type: 'red' },
    { id: 18, text: 'Play 50 times home', type: 'blue' },
    { id: 19, text: 'Score 500 goals', type: 'yellow' },
    { id: 20, text: 'Rob 50 NFT', type: 'purple' },
    { id: 21, text: 'Just a Chill Case Magic can happen some days', type: 'white' },
    { id: 22, text: 'BONUS CARD', type: 'green' },
    // Côté gauche (23-30) - inversé pour le rendu
    { id: 23, text: 'MALUS CARD', type: 'red' },
    { id: 24, text: 'Just a Chill Case Magic can happen some days', type: 'white' },
    { id: 25, text: 'Rob a Rare NFT in our last 5 games', type: 'purple' },
    { id: 26, text: 'Score 1000 goals', type: 'yellow' },
    { id: 27, text: 'Play 200 times home', type: 'blue' },
    { id: 28, text: 'Rob 100 NFT', type: 'purple' },
    { id: 29, text: 'Play 500 games Home', type: 'blue' },
    { id: 30, text: 'Rob an Epic NFT in our last 5 games or 3 rare in our last 10 games', type: 'purple' }
  ];

  // Cartes du centre
  const centerBonusCards = [
    { type: 'bonus', text: 'BONUS CARD +2 case' },
    { type: 'bonus', text: 'BONUS CARD +2 case' },
    { type: 'bonus', text: 'BONUS CARD +3 case' },
    { type: 'bonus', text: 'BONUS CARD +3 case' },
    { type: 'bonus', text: 'BONUS CARD +4 case' },
    { type: 'bonus', text: 'BONUS CARD Get One Free NFT+2 case' },
    { type: 'bonus', text: 'BONUS CARD' },
    { type: 'bonus', text: 'BONUS CARD' }
  ];

  const centerMalusCards = [
    { type: 'malus', text: 'MALUS CARD -3 case' },
    { type: 'malus', text: 'MALUS CARD -3 case' },
    { type: 'malus', text: 'MALUS CARD -3 case' },
    { type: 'malus', text: 'MALUS CARD -2 cases' },
    { type: 'malus', text: 'MALUS CARD -2 case' },
    { type: 'malus', text: 'MALUS CARD -2 case' },
    { type: 'malus', text: 'MALUS CARD -1 case' },
    { type: 'malus', text: 'MALUS CARD -5 case' }
  ];

  const GameBoard = () => {
    const getCellBackground = (type: CellType): string => {
      const colors = {
        white: 'bg-white border border-gray-200',
        purple: 'bg-purple-100 border border-purple-200',
        blue: 'bg-blue-100 border border-blue-200',
        yellow: 'bg-yellow-100 border border-yellow-200',
        green: 'bg-green-100 border border-green-200',
        red: 'bg-red-100 border border-red-200',
        orange: 'bg-orange-100 border border-orange-200'
      };
      return colors[type];
    };

    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        {/* Plateau de jeu externe */}
        <div className="relative grid grid-cols-7 gap-1">
          {/* Première ligne (1-7) */}
          {boardCells.slice(0, 7).map(cell => (
            <div key={cell.id} 
                 className={`aspect-square p-2 rounded-lg text-center text-xs font-medium flex items-center justify-center ${getCellBackground(cell.type)}`}>
              <span className="text-center">{cell.text}</span>
            </div>
          ))}

          {/* Cases latérales */}
          <div className="col-span-7 grid grid-cols-7 gap-1">
            {/* Côté gauche (23-30) */}
            <div className="col-span-1 space-y-1">
              {boardCells.slice(22, 30).reverse().map(cell => (
                <div key={cell.id} 
                     className={`aspect-square p-2 rounded-lg text-center text-xs font-medium flex items-center justify-center ${getCellBackground(cell.type)}`}>
                  <span className="text-center">{cell.text}</span>
                </div>
              ))}
            </div>

            {/* Zone centrale */}
            <div className="col-span-5 p-4">
              <div className="bg-green-50 rounded-xl p-6 h-full">
                <div className="text-center mb-8">
                  <h3 className="text-lg font-bold mb-2">ADD MY NFT AND FIND A FIGHT</h3>
                  <p className="mb-2">Make your CARD DESK and choose a sports</p>
                  <p className="mb-2">Football / American Football / Tennis / MMA</p>
                  <p>Au début mise en place de bot</p>
                </div>

                {/* Cartes bonus */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {centerBonusCards.map((card, index) => (
                    <div key={`bonus-${index}`} 
                         className="bg-green-100 border border-green-200 rounded-lg p-2 text-xs text-center">
                      {card.text}
                    </div>
                  ))}
                </div>

                {/* Cartes malus */}
                <div className="grid grid-cols-4 gap-2">
                  {centerMalusCards.map((card, index) => (
                    <div key={`malus-${index}`} 
                         className="bg-red-100 border border-red-200 rounded-lg p-2 text-xs text-center">
                      {card.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Côté droit (8-15) */}
            <div className="col-span-1 space-y-1">
              {boardCells.slice(7, 15).map(cell => (
                <div key={cell.id} 
                     className={`aspect-square p-2 rounded-lg text-center text-xs font-medium flex items-center justify-center ${getCellBackground(cell.type)}`}>
                  <span className="text-center">{cell.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dernière ligne (16-22) */}
          {boardCells.slice(15, 22).reverse().map(cell => (
            <div key={cell.id} 
                 className={`aspect-square p-2 rounded-lg text-center text-xs font-medium flex items-center justify-center ${getCellBackground(cell.type)}`}>
              <span className="text-center">{cell.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 mx-auto my-4 max-w-7xl shadow-md">
      <div className="flex gap-4 p-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('betting')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors
            ${activeTab === 'betting' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Betting
        </button>
        <button
          onClick={() => setActiveTab('nft')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors
            ${activeTab === 'nft' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          NFT
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'betting' ? children : <GameBoard />}
      </div>
    </div>
  );
};

export default NavigationTabs;