import { ReactNode, useState } from 'react';

interface NavigationTabsProps {
  children: ReactNode;
}

type CellType = 'white' | 'purple' | 'blue' | 'yellow' | 'green' | 'red' | 'orange';

interface BoardCell {
  id: number;
  text: string;
  type: CellType;
  bgColor: string;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'betting' | 'nft'>('betting');

  const boardCells: BoardCell[] = [
    { id: 1, text: 'Get 2 free NFT each turn', type: 'white', bgColor: 'bg-white' },
    { id: 2, text: 'Rob 1 NFT', type: 'purple', bgColor: 'bg-purple-100' },
    { id: 3, text: 'Do 5 games', type: 'orange', bgColor: 'bg-orange-100' },
    { id: 4, text: 'Rob 5 NFT', type: 'purple', bgColor: 'bg-purple-100' },
    { id: 5, text: 'Play 10 times Home', type: 'blue', bgColor: 'bg-blue-100' },
    { id: 6, text: 'Score 50 goals', type: 'yellow', bgColor: 'bg-yellow-100' },
    { id: 7, text: 'BONUS CARD', type: 'green', bgColor: 'bg-green-100' },
    { id: 8, text: 'MALUS CARD', type: 'red', bgColor: 'bg-red-100' },
    { id: 9, text: 'Play 20 games Home', type: 'blue', bgColor: 'bg-blue-100' },
    { id: 10, text: 'Rob 15 NFT', type: 'purple', bgColor: 'bg-purple-100' },
    { id: 11, text: 'Play 20 times home', type: 'blue', bgColor: 'bg-blue-100' },
    { id: 12, text: 'Score 100 goals', type: 'yellow', bgColor: 'bg-yellow-100' },
    { id: 13, text: 'Rob a Rare NFT in our last 5 games', type: 'purple', bgColor: 'bg-purple-100' },
    { id: 14, text: 'Just a Chill Case Magic can happen some days', type: 'white', bgColor: 'bg-white' },
    { id: 15, text: 'Play 100 Games', type: 'yellow', bgColor: 'bg-yellow-100' },
    { id: 16, text: 'BONUS CARD', type: 'green', bgColor: 'bg-green-100' },
    { id: 17, text: 'MALUS CARD', type: 'red', bgColor: 'bg-red-100' },
    { id: 18, text: 'Play 50 times home', type: 'blue', bgColor: 'bg-blue-100' },
    { id: 19, text: 'Score 500 goals', type: 'yellow', bgColor: 'bg-yellow-100' },
    { id: 20, text: 'Rob 50 NFT', type: 'purple', bgColor: 'bg-purple-100' },
    { id: 21, text: 'Just a Chill Case Magic can happen some days', type: 'white', bgColor: 'bg-white' },
    { id: 22, text: 'BONUS CARD', type: 'green', bgColor: 'bg-green-100' },
    { id: 23, text: 'MALUS CARD', type: 'red', bgColor: 'bg-red-100' },
    { id: 24, text: 'Just a Chill Case Magic can happen some days', type: 'white', bgColor: 'bg-white' },
    { id: 25, text: 'Rob a Rare NFT in our last 5 games', type: 'purple', bgColor: 'bg-purple-100' },
    { id: 26, text: 'Score 1000 goals', type: 'yellow', bgColor: 'bg-yellow-100' },
    { id: 27, text: 'Play 200 times home', type: 'blue', bgColor: 'bg-blue-100' },
    { id: 28, text: 'Rob 100 NFT', type: 'purple', bgColor: 'bg-purple-100' },
    { id: 29, text: 'Play 500 games Home', type: 'blue', bgColor: 'bg-blue-100' },
    { id: 30, text: 'Rob an Epic NFT in our last 5 games or 3 rare in our last 10 games', type: 'purple', bgColor: 'bg-purple-100' }
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
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="relative bg-gray-50 rounded-xl p-4">
          {/* Plateau de jeu principal */}
          <div className="grid grid-cols-7 gap-2">
            {/* Première ligne */}
            {boardCells.slice(0, 7).map((cell) => (
              <div
                key={cell.id}
                className={`${cell.bgColor} p-3 rounded-lg shadow border border-gray-200 flex items-center justify-center text-center text-xs font-medium min-h-[80px]`}
              >
                {cell.text}
              </div>
            ))}

            {/* Section centrale */}
            <div className="col-span-7 grid grid-cols-7 gap-2">
              {/* Colonne gauche */}
              <div className="flex flex-col gap-2">
                {boardCells.slice(22, 30).reverse().map((cell) => (
                  <div
                    key={cell.id}
                    className={`${cell.bgColor} p-3 rounded-lg shadow border border-gray-200 flex items-center justify-center text-center text-xs font-medium min-h-[80px]`}
                  >
                    {cell.text}
                  </div>
                ))}
              </div>

              {/* Zone centrale */}
              <div className="col-span-5 bg-white rounded-xl p-6 border border-gray-200 shadow">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold mb-2">ADD MY NFT AND FIND A FIGHT</h2>
                  <p className="mb-1">Make your CARD DESK and choose a sports</p>
                  <p className="mb-1">Football / American Football / Tennis / MMA</p>
                  <p>Au début mise en place de bot</p>
                </div>

                {/* Cartes bonus */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {bonusCards.map((card, index) => (
                    <div key={`bonus-${index}`} className="bg-green-100 border border-green-200 rounded-lg p-2 text-xs text-center shadow-sm">
                      {card}
                    </div>
                  ))}
                </div>

                {/* Cartes malus */}
                <div className="grid grid-cols-4 gap-2">
                  {malusCards.map((card, index) => (
                    <div key={`malus-${index}`} className="bg-red-100 border border-red-200 rounded-lg p-2 text-xs text-center shadow-sm">
                      {card}
                    </div>
                  ))}
                </div>
              </div>

              {/* Colonne droite */}
              <div className="flex flex-col gap-2">
                {boardCells.slice(7, 15).map((cell) => (
                  <div
                    key={cell.id}
                    className={`${cell.bgColor} p-3 rounded-lg shadow border border-gray-200 flex items-center justify-center text-center text-xs font-medium min-h-[80px]`}
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
                className={`${cell.bgColor} p-3 rounded-lg shadow border border-gray-200 flex items-center justify-center text-center text-xs font-medium min-h-[80px]`}
              >
                {cell.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 mx-auto mt-4 mb-8 shadow">
      {/* Navigation */}
      <div className="flex gap-1 p-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('betting')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors
            ${activeTab === 'betting' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Betting
        </button>
        <button
          onClick={() => setActiveTab('nft')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors
            ${activeTab === 'nft' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          NFT
        </button>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {activeTab === 'betting' ? children : <GameBoard />}
      </div>
    </div>
  );
};

export default NavigationTabs;