import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WriteContract, WriteContractData } from './components/WriteContract';
import { SignMessage, SignMessageProps } from './components/SignMessage';
import { Account } from './components/Account';
import { Connect } from './components/Connect';
import ReactJson from 'react-json-view';
import { getSchemaError, sendEvent } from './utils';
import { formatEther } from 'viem';
import { ethers } from 'ethers';
import { BOX_ABI } from './constants/contracts';
import BetModal from './components/BetModal';



// Types for sports and tokens
type SportsType = {
  [key in 'SOCCER' | 'F1' | 'MMA' | 'NFL' | 'BASKETBALL']: boolean;
};

type TokensType = {
  ETH: boolean;
  KRILL: boolean;
  custom: string;
};

interface Filters {
  sports: SportsType;
  tokens: TokensType;
  myGames: boolean;
}

// Sport emojis
const SPORT_EMOJIS: Record<keyof SportsType, string> = {
  SOCCER: '⚽',
  F1: '🏎️',
  MMA: '🥊',
  NFL: '🏈',
  BASKETBALL: '🏀'
};

interface SportData {
  home_team?: string;
  away_team?: string;
  tournament?: string;
  scheduled?: string;
  status?: string;
}

interface TokenData {
  symbol: string;
  amount: string;
  address: string | null;
}

interface Bet {
  participant: string;
  prediction: boolean;
  amount: string;
}

interface Box {
  address: string;
  chainId: number;
  sportId: string;
  sportData: SportData;
  bets: Bet[];
  isSettled: boolean;
  totalAmount: string;
  tokenData: TokenData;
  lastUpdated: string;
  imageData?: string;
  initialEvents: Array<{who: string; prediction: string}>;
}

interface Stats {
  totalPlayers: number;
  activeBoxes: number;
  ethVolume: string;
  krillVolume: string;
  otherTokensVolume: string;
}

interface ApiResponse {
  success: boolean;
  boxes: Box[];
}



export default function App() {
  const { isConnected, address } = useAccount();
  const [transactionData, setTransactionData] = useState<WriteContractData>();
  const [signMessageData, setSignMessageData] = useState<SignMessageProps>();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPlayers: 0,
    activeBoxes: 0,
    ethVolume: '0',
    krillVolume: '0',
    otherTokensVolume: '0'
  });
  const [lastUpdate, setLastUpdate] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [callbackEndpoint, setCallbackEndpoint] = useState('');
  const [schemaError, setSchemaError] = useState<any>(false);
  const [callbackError, setCallbackError] = useState<any>();
  const [uid, setUid] = useState<string | undefined>();
  const [operationType, setOperationType] = useState<string>("");
  const [botName, setBotName] = useState<string>("");
  const [filters, setFilters] = useState<Filters>({
    sports: {
      SOCCER: false,
      F1: false,
      MMA: false,
      NFL: false,
      BASKETBALL: false
    },
    tokens: {
      ETH: false,
      KRILL: false,
      custom: ''
    },
    myGames: false
  });

  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [selectedBetType, setSelectedBetType] = useState<'hunt' | 'fish' | null>(null);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);

  const calculateTimeLeft = (scheduledTime: string) => {
    const difference = new Date(scheduledTime).getTime() - new Date().getTime();
    
    if (difference <= 0) return 'Box Closed';
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m`;
  };

  const calculateStats = (boxes: Box[]): Stats => {
    try {
      const activeBoxes = boxes.filter(box => !box.isSettled);
      const uniquePlayers = new Set<string>();
      let ethVolume = BigInt(0);
      let krillVolume = BigInt(0);
      let otherVolume = BigInt(0);
  
      boxes.forEach(box => {
        // Calcul des joueurs uniques
        box.bets.forEach(bet => uniquePlayers.add(bet.participant));
        
        // Calcul des volumes avec vérification du type de token
        const amount = box.totalAmount ? BigInt(box.totalAmount) : BigInt(0);
        
        if (!box.tokenData.address) {
          ethVolume += amount;
        } else if (box.tokenData.symbol === 'KRILL') {
          krillVolume += amount;
        } else {
          otherVolume += amount;
        }
      });
  
      return {
        totalPlayers: uniquePlayers.size,
        activeBoxes: activeBoxes.length,
        ethVolume: formatEther(ethVolume),
        krillVolume: formatEther(krillVolume),
        otherTokensVolume: formatEther(otherVolume)
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalPlayers: 0,
        activeBoxes: 0,
        ethVolume: '0',
        krillVolume: '0',
        otherTokensVolume: '0'
      };
    }
  };

  const fetchBoxes = async (): Promise<void> => {
    try {
      const response = await fetch('https://witbbot-638008614172.us-central1.run.app/boxes');
      const data = await response.json() as ApiResponse;
      
      if (data.success && Array.isArray(data.boxes)) {
        const cutoffDate = new Date('2023-11-20');
        const filteredBoxes = data.boxes
          .filter((box: Box) => new Date(box.lastUpdated) >= cutoffDate)
          .sort((a: Box, b: Box) => 
            new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
          );
        
        setBoxes(filteredBoxes);
        setStats(calculateStats(filteredBoxes));

        const updates: Record<string, string> = {};
        filteredBoxes.forEach((box: Box) => {
          updates[box.address] = box.lastUpdated;
        });
        setLastUpdate(updates);
      }
    } catch (error) {
      console.error('Error fetching boxes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string): string => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const getFilteredBoxes = (boxes: Box[]) => {
    return boxes.filter(box => {
      // Filtre des sports
      const sportId = box.sportId as keyof SportsType;
      const sportFilter = !Object.values(filters.sports).some(v => v) || 
                         filters.sports[sportId];
  
      // Filtre des tokens
      const isEth = !box.tokenData.address;
      const isKrill = box.tokenData.symbol === 'KRILL';
      const isCustomToken = box.tokenData.address?.toLowerCase() === filters.tokens.custom.toLowerCase();
      
      const tokenFilter = !Object.values({ ...filters.tokens, custom: false }).some(v => v) || 
                         (filters.tokens.ETH && isEth) ||
                         (filters.tokens.KRILL && isKrill) ||
                         (filters.tokens.custom && isCustomToken);
  
      // Filtre My Games - vérifie si l'utilisateur a participé à la box
      const myGamesFilter = !filters.myGames || 
                           (address && box.bets.some(bet => 
                             bet.participant.toLowerCase() === address.toLowerCase()
                           ));
  
      return sportFilter && tokenFilter && myGamesFilter;
    });
  };

  const calculateHunterPercentage = (bets: Bet[]): number => {
    if (bets.length === 0) return 0;
    const hunters = bets.filter(bet => bet.prediction).length;
    return (hunters / bets.length) * 100;
  };

  const getBoxStatus = (box: Box) => {
    const status = box.sportData?.status === 'live' ? 'live' : box.isSettled ? 'settled' : 'active';
    const emoji = status === 'active' ? '🟢' : status === 'live' ? '🟡' : '🔴';
    const aiStatus = box.isSettled ? '🤖 ✅' : '🤖 ⏳';
    const settlementStatus = box.isSettled ? '⚡ ✅' : '⚡ ⏳';
    
    return {
      status: `${emoji} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      aiStatus,
      settlementStatus
    };
  };

  // Effects
  useEffect(() => {
    fetchBoxes();
    const interval = setInterval(fetchBoxes, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    setBotName(queryParameters.get("botName") as string);
    setUid(queryParameters.get("uid") as string);
    setCallbackEndpoint(queryParameters.get("callback") as string);
    const actionType = queryParameters.get("type") === "signature" ? "signature" : "transaction";
    setOperationType(actionType);

    const source = queryParameters.get("source");
    if (source) {
      fetch(source)
        .then(response => response.json())
        .then(data => {
          const error = getSchemaError(actionType, data);
          if (error) {
            setSchemaError(error);
          } else {
            actionType === "signature" ? setSignMessageData(data) : setTransactionData(data);
          }
        })
        .catch(error => {
          setSchemaError(error);
        });
    }
  }, []);

  const handleBet = async (amount: string): Promise<void> => {
    if (!window.ethereum || !selectedBox || !selectedBox.address) return;
    
    try {
      const amountInWei = ethers.parseEther(amount);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Cas 1: Pari avec des tokens ERC20 (KRILL ou autre)
      if (selectedBox.tokenData.address) {
        console.log('Token bet - Starting approval process...');
        
        // 1ère transaction: Approve
        const tokenContract = new ethers.Contract(
          selectedBox.tokenData.address,
          [
            'function approve(address spender, uint256 value) returns (bool)'
          ],
          signer
        );
        
        const approveTx = await tokenContract.approve(selectedBox.address, amountInWei);
        console.log('Waiting for approval confirmation...');
        await approveTx.wait();
        
        // 2ème transaction: Bet
        const boxContract = new ethers.Contract(
          selectedBox.address,
          BOX_ABI,
          signer
        );
        console.log('Approval confirmed, placing bet...');
        const betTx = await boxContract.createBetWithAmount(selectedBetType === 'hunt', amountInWei);
        await betTx.wait();
        
      // Cas 2: Pari avec de l'ETH
      } else {
        console.log('ETH bet - Single transaction...');
        const boxContract = new ethers.Contract(
          selectedBox.address,
          BOX_ABI,
          signer
        );
        
        // Une seule transaction avec value en ETH
        const tx = await boxContract.createBet(
          selectedBetType === 'hunt',
          { value: amountInWei }
        );
        await tx.wait();
      }
      
      console.log('Bet successful, refreshing data...');
      await fetchBoxes();
      
    } catch (error) {
      console.error('Error placing bet:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to place bet. Please check your wallet and try again.'
      );
    }
  };

  const onCallbackError = (error: any) => {
    setCallbackError(error);
  };

  return (
    <>
      {isConnected && !schemaError && <Account botName={botName} />}
      {!isConnected && !schemaError && <Connect />}

      {/* Main Content - visible même sans connexion */}
      {(!transactionData && !signMessageData) && (
        <>
          {/* Stats Panel */}
          <div className="stats-container">
            <h2 className="stats-title">🐳 Whale in the Box 📦</h2>
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

          {/* Filter Section */}
          <div className="filter-container">
            <div className="filter-bar">
              <div className="filter-group">
                <span className="filter-label">Sports</span>
                <div className="filter-options">
                  {(Object.entries(SPORT_EMOJIS) as [keyof SportsType, string][]).map(([sport, emoji]) => (
                    <label key={sport} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.sports[sport]}
                        onChange={(e) => {
                          const newSportsFilter = {...filters.sports};
                          newSportsFilter[sport] = e.target.checked;
                          setFilters(prev => ({
                            ...prev,
                            sports: newSportsFilter
                          }));
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className="ml-2">{emoji} {sport}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-label">Tokens</span>
                <div className="filter-options">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.tokens.ETH}
                      onChange={(e) => {
                        setFilters(prev => ({
                          ...prev,
                          tokens: { 
                            ...prev.tokens, 
                            ETH: e.target.checked,
                            // Réinitialiser les autres si celui-ci est coché
                            KRILL: e.target.checked ? false : prev.tokens.KRILL,
                            custom: e.target.checked ? '' : prev.tokens.custom
                          }
                        }));
                      }}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-2">ETH</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.tokens.KRILL}
                      onChange={(e) => {
                        setFilters(prev => ({
                          ...prev,
                          tokens: {
                            ...prev.tokens,
                            KRILL: e.target.checked,
                            // Réinitialiser les autres si celui-ci est coché
                            ETH: e.target.checked ? false : prev.tokens.ETH,
                            custom: e.target.checked ? '' : prev.tokens.custom
                          }
                        }));
                      }}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-2">KRILL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Custom Token Address"
                    value={filters.tokens.custom}
                    onChange={(e) => {
                      setFilters(prev => ({
                        ...prev,
                        tokens: {
                          ...prev.tokens,
                          custom: e.target.value,
                          // Réinitialiser les autres si une adresse est entrée
                          ETH: e.target.value ? false : prev.tokens.ETH,
                          KRILL: e.target.value ? false : prev.tokens.KRILL
                        }
                      }));
                    }}
                    disabled={filters.tokens.ETH || filters.tokens.KRILL}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
              </div>

              {isConnected && (
                <div className="filter-group">
                  <span className="filter-label">View</span>
                  <div className="filter-options">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.myGames}
                        onChange={(e) =>
                          setFilters(prev => ({
                            ...prev,
                            myGames: e.target.checked
                          }))
                        }
                        className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className="ml-2">🎮 My Games</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
  
          {/* Boxes Grid */}
          <div className="boxes-container">
            {isLoading ? (
              <div className="loading">Loading boxes...</div>
            ) : (
              <div className="boxes-grid">
                {getFilteredBoxes(boxes).map((box: Box) => {
                  const boxStatus = getBoxStatus(box);
                  const hunterPercentage = calculateHunterPercentage(box.bets);
                  
                  return (
                    <div 
                      key={box.address} 
                      className={`box-card ${lastUpdate[box.address] > box.lastUpdated ? 'box-updated' : ''}`}
                    >
                      {box.imageData && (
                        <div className="box-image-container">
                          <img 
                            src={`data:image/png;base64,${box.imageData}`}
                            alt={`${box.sportId} box preview`}
                            className="box-image"
                          />
                        </div>
                      )}
                      
                      <div className="box-content">
                        <div className="box-header">
                          <span className="box-sport">
                            {SPORT_EMOJIS[box.sportId as keyof SportsType]} {box.sportId}
                          </span>
                          <span className="box-time">
                            {box.sportData?.scheduled && calculateTimeLeft(box.sportData.scheduled)}
                          </span>
                        </div>
                        
                        <div className="box-teams">
                          {box.sportData?.home_team} vs {box.sportData?.away_team}
                        </div>
                        
                        <div className="box-tournament">
                          {box.sportData?.tournament}
                        </div>

                        {/* Total Amount Highlight */}
                        <div className="total-amount-highlight">
                          <div className="amount-label">Total Pool</div>
                          <div className="amount-value">
                            {formatEther(BigInt(box.totalAmount || '0'))} {box.tokenData.symbol || 'ETH'}
                          </div>
                        </div>

                        {!box.isSettled && 
                          !boxStatus.status.toLowerCase().includes('live') && 
                          new Date(box.sportData?.scheduled || '').getTime() > Date.now() && (
                            <div className="betting-actions">
                              <div className="betting-buttons">
                                {isConnected ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedBetType('hunt');
                                        setSelectedBox(box);
                                        setIsBetModalOpen(true);
                                      }}
                                      className="hunt-button"
                                    >
                                      <span>🎯</span>
                                      <span>Hunt</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedBetType('fish');
                                        setSelectedBox(box);
                                        setIsBetModalOpen(true);
                                      }}
                                      className="fish-button"
                                    >
                                      <span>🎣</span>
                                      <span>Fish</span>
                                    </button>
                                  </>
                                ) : (
                                  <div className="connect-notice">
                                    Connect wallet to place bets
                                  </div>
                                )}
                              </div>
                            </div>
                        )}


                        {/* Predictions Section */}
                        {box.initialEvents && box.initialEvents.length > 0 && (
                          <div className="predictions-section">
                            <h4>Predictions</h4>
                            {box.initialEvents.map((event, index) => (
                              <div key={index} className="prediction-item">
                                {event.who}: {event.prediction}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Hunter vs Fisher Progress Bar */}
                        <div className="prediction-bar">
                          <div className="bar-container">
                            <div 
                              className="hunters-bar"
                              style={{ width: `${hunterPercentage}%` }}
                            />
                            <div 
                              className="fishers-bar"
                              style={{ width: `${100 - hunterPercentage}%`, left: `${hunterPercentage}%` }}
                            />
                          </div>
                          <div className="bar-labels">
                            <span className="hunters-label">🎯 {hunterPercentage.toFixed(1)}%</span>
                            <span className="fishers-label">🎣 {(100 - hunterPercentage).toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        <div className="box-info">
                          <span className="box-address">{formatAddress(box.address)}</span>
                          <span className="box-participants">🐳 {box.bets.length}</span>
                        </div>
                        
                        <div className="box-footer">
                          <div className="status-container">
                            <span className={`status-badge ${boxStatus.status.toLowerCase().includes('active') ? 'active' : 
                                          boxStatus.status.toLowerCase().includes('live') ? 'live' : 'settled'}`}>
                              {boxStatus.status}
                            </span>
                            <span className="status-badge">{boxStatus.aiStatus}</span>
                            <span className="status-badge">{boxStatus.settlementStatus}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {selectedBox && (
            <BetModal
              isOpen={isBetModalOpen}
              onClose={() => {
                setIsBetModalOpen(false);
                setSelectedBetType(null);
                setSelectedBox(null);
              }}
              onConfirm={handleBet}
              tokenSymbol={selectedBox.tokenData.symbol || 'ETH'}
              betType={selectedBetType || 'hunt'}
            />
          )}
        </>
      )}

      {/* Transaction/Signature Components */}
      {isConnected && !schemaError && (transactionData || signMessageData) && (
        <>
          {operationType === "transaction" && transactionData && uid && (
            <>
              <div className="container">
                <ReactJson src={transactionData} collapsed theme="monokai" />
              </div>
              <WriteContract
                uid={uid}
                chainId={transactionData.chainId}
                address={transactionData.address}
                abi={transactionData.abi}
                functionName={transactionData.functionName}
                args={transactionData.args}
                value={transactionData.value}
                sendEvent={(data: any) => sendEvent(uid, callbackEndpoint, onCallbackError, { ...data, transaction: true })}
              />
            </>
          )}

          {operationType === "signature" && signMessageData && uid && (
              <>
                <div className="container">
                  <ReactJson src={signMessageData} collapsed theme="monokai" />
                </div>
                <SignMessage
                  uid={uid}
                  domain={{
                    name: signMessageData.domain?.name || '',
                    version: signMessageData.domain?.version || '',
                    chainId: signMessageData.domain?.chainId || 1,
                    verifyingContract: signMessageData.domain?.verifyingContract || ''
                  }}
                  primaryType={signMessageData.primaryType}
                  types={signMessageData.types}
                  message={signMessageData.message}
                  sendEvent={(data: any) => sendEvent(uid, callbackEndpoint, onCallbackError, { ...data, signature: true })}
                />
              </>
            )}
        </>
      )}

      {/* Error States */}
      {schemaError && (
        <div className="container parsingError">
          <div>Source doesnt match schema</div>
          <ReactJson src={JSON.parse(JSON.stringify(schemaError))} collapsed theme="monokai" />
        </div>
      )}

      {callbackError && (
        <div className="container callbackError">
          <div>There was an error during callback request to {callbackEndpoint}</div>
          <ReactJson src={callbackError} collapsed theme="monokai" />
        </div>
      )}
    </>
  );
}