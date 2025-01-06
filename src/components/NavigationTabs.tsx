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

  // Cartes du centre
  const centerCards = {
    bonus: [
      'BONUS CARD +2 case',
      'BONUS CARD +2 case',
      'BONUS CARD +3 case',
      'BONUS CARD +3 case',
      'BONUS CARD +4 case',
      'BONUS CARD Get One Free NFT+2 case',
      'BONUS CARD',
      'BONUS CARD'
    ],
    malus: [
      'MALUS CARD -3 case',
      'MALUS CARD -3 case',
      'MALUS CARD -3 case',
      'MALUS CARD -2 cases',
      'MALUS CARD -2 case',
      'MALUS CARD -2 case',
      'MALUS CARD -1 case',
      'MALUS CARD -5 case'
    ]
  };

  const GameBoard = () => {
    return (
      <div className="w-full max-w-6xl mx-auto overflow-hidden p-4">
        <div className="relative w-full aspect-square bg-gray-100 rounded-lg p-2">
          {/* Grille de jeu */}
          <div className="grid grid-cols-7 gap-2 h-full">
            {/* Première rangée */}
            <div className="col-span-7 grid grid-cols-7 gap-2">
              {boardCells.slice(0, 7).map(cell => (
                <div key={cell.id} 
                  className={`rounded-lg ${cell.type === 'white' ? 'bg-white' : 
                    cell.type === 'purple' ? 'bg-purple-100' :
                    cell.type === 'blue' ? 'bg-blue-100' :
                    cell.type === 'yellow' ? 'bg-yellow-100' :
                    cell.type === 'green' ? 'bg-green-100' :
                    cell.type === 'red' ? 'bg-red-100' :
                    'bg-orange-100'} border flex items-center justify-center p-2 text-xs text-center font-medium`}
                >
                  {cell.text}
                </div>
              ))}
            </div>

            {/* Section du milieu */}
            <div className="col-span-7 grid grid-cols-7 gap-2 h-full">
              {/* Cellules de gauche */}
              <div className="space-y-2">
                {boardCells.slice(22, 30).reverse().map(cell => (
                  <div key={cell.id} 
                    className={`h-full rounded-lg ${cell.type === 'white' ? 'bg-white' : 
                      cell.type === 'purple' ? 'bg-purple-100' :
                      cell.type === 'blue' ? 'bg-blue-100' :
                      cell.type === 'yellow' ? 'bg-yellow-100' :
                      cell.type === 'green' ? 'bg-green-100' :
                      cell.type === 'red' ? 'bg-red-100' :
                      'bg-orange-100'} border flex items-center justify-center p-2 text-xs text-center font-medium`}
                  >
                    {cell.text}
                  </div>
                ))}
              </div>

              {/* Zone centrale */}
              <div className="col-span-5 bg-green-50 rounded-xl p-4">
                <div className="h-full flex flex-col">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold">ADD MY NFT AND FIND A FIGHT</h3>
                    <p className="my-2">Make your CARD DESK and choose a sports</p>
                    <p>Football / American Football / Tennis / MMA</p>
                    <p className="mt-2">Au début mise en place de bot</p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {centerCards.bonus.map((text, index) => (
                      <div key={`bonus-${index}`} className="bg-green-100 border border-green-200 rounded-lg p-2 text-xs text-center">
                        {text}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {centerCards.malus.map((text, index) => (
                      <div key={`malus-${index}`} className="bg-red-100 border border-red-200 rounded-lg p-2 text-xs text-center">
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cellules de droite */}
              <div className="space-y-2">
                {boardCells.slice(7, 15).map(cell => (
                  <div key={cell.id} 
                    className={`h-full rounded-lg ${cell.type === 'white' ? 'bg-white' : 
                      cell.type === 'purple' ? 'bg-purple-100' :
                      cell.type === 'blue' ? 'bg-blue-100' :
                      cell.type === 'yellow' ? 'bg-yellow-100' :
                      cell.type === 'green' ? 'bg-green-100' :
                      cell.type === 'red' ? 'bg-red-100' :
                      'bg-orange-100'} border flex items-center justify-center p-2 text-xs text-center font-medium`}
                  >
                    {cell.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Dernière rangée */}
            <div className="col-span-7 grid grid-cols-7 gap-2">
              {boardCells.slice(15, 22).reverse().map(cell => (
                <div key={cell.id} 
                  className={`rounded-lg ${cell.type === 'white' ? 'bg-white' : 
                    cell.type === 'purple' ? 'bg-purple-100' :
                    cell.type === 'blue' ? 'bg-blue-100' :
                    cell.type === 'yellow' ? 'bg-yellow-100' :
                    cell.type === 'green' ? 'bg-green-100' :
                    cell.type === 'red' ? 'bg-red-100' :
                    'bg-orange-100'} border flex items-center justify-center p-2 text-xs text-center font-medium`}
                >
                  {cell.text}
                </div>
              ))}
            </div>
          </div>
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
            ${activeTab === 'betting' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Betting
        </button>
        <button
          onClick={() => setActiveTab('nft')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors
            ${activeTab === 'nft' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
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