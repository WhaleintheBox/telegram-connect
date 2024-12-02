import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WriteContract, WriteContractData } from './components/WriteContract';
import { SignMessage, SignMessageProps } from './components/SignMessage';
import { Account } from './components/Account';
import { Connect } from './components/Connect';
import { getSchemaError, sendEvent } from './utils';
import { formatEther } from 'viem';
import { ethers } from 'ethers';
import { ERC20_ABI, BOX_ABI } from './constants/contracts';

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

const SPORT_EMOJIS: Record<keyof SportsType, string> = {
  SOCCER: '⚽', F1: '🏎️', MMA: '🥊', NFL: '🏈', BASKETBALL: '🏀'
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
  
  // Core states
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPlayers: 0,
    activeBoxes: 0,
    ethVolume: '0',
    krillVolume: '0',
    otherTokensVolume: '0'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Transaction states
  const [transactionData, setTransactionData] = useState<WriteContractData>();
  const [signMessageData, setSignMessageData] = useState<SignMessageProps>();
  const [callbackEndpoint, setCallbackEndpoint] = useState('');
  const [schemaError, setSchemaError] = useState<any>(false);
  const [callbackError, setCallbackError] = useState<any>();
  const [uid, setUid] = useState<string | undefined>();
  const [operationType, setOperationType] = useState<string>("");
  const [botName, setBotName] = useState<string>("");

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    sports: {
      SOCCER: false, F1: false, MMA: false, NFL: false, BASKETBALL: false
    },
    tokens: {
      ETH: false,
      KRILL: false,
      custom: ''
    },
    myGames: false
  });

  // Betting states
  const [selectedBetType, setSelectedBetType] = useState<'hunt' | 'fish' | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeBetBox, setActiveBetBox] = useState<Box | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'initial' | 'approving' | 'approved' | 'betting' | 'complete'>('initial');
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);

  const onCallbackError = (error: any) => {
    setCallbackError(error);
  };

  const BettingSection = ({ box }: { box: Box }) => {
    const isEthBet = !box.tokenData.address;
    const quickAmounts = ['0.01', '0.05', '0.1', '0.5'];
    const isActive = box === activeBetBox;
    const [tokenBalance, setTokenBalance] = useState<string>('0');
    const [tokenAllowance, setTokenAllowance] = useState<string>('0');
    const [isApprovalRequired, setIsApprovalRequired] = useState(false);
    
    useEffect(() => {
      const fetchTokenInfo = async () => {
        if (!window.ethereum || !address || isEthBet) return;
        
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const tokenContract = new ethers.Contract(
            box.tokenData.address!,
            ERC20_ABI,
            provider
          );
          
          const [balance, allowance] = await Promise.all([
            tokenContract.balanceOf(address),
            tokenContract.allowance(address, box.address)
          ]);
          
          setTokenBalance(ethers.formatEther(balance));
          setTokenAllowance(ethers.formatEther(allowance));
        } catch (error) {
          console.error('Error fetching token info:', error);
        }
      };
      
      fetchTokenInfo();
    }, [box.tokenData.address, address, isEthBet]);
  
    // Check if approval is needed when bet amount changes
    useEffect(() => {
      if (!isEthBet && betAmount) {
        const amountInWei = ethers.parseEther(betAmount);
        const currentAllowance = ethers.parseEther(tokenAllowance);
        setIsApprovalRequired(currentAllowance < amountInWei);
      }
    }, [betAmount, tokenAllowance, isEthBet]);
  
    const handleApproval = async () => {
      if (!window.ethereum || !betAmount || !address) return;
      setIsProcessing(true);
      setTransactionStatus('approving');
  
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new ethers.Contract(
          box.tokenData.address!,
          ERC20_ABI,
          signer
        );
  
        const amountInWei = ethers.parseEther(betAmount);
        const approveTx = await tokenContract.approve(box.address, amountInWei, {
          gasLimit: 100000
        });
        
        setCurrentTxHash(approveTx.hash);
        await approveTx.wait();
        setTokenAllowance(ethers.formatEther(amountInWei));
        setIsApprovalRequired(false);
        setTransactionStatus('approved');
      } catch (error) {
        console.error('Approval error:', error);
        setTransactionStatus('initial');
        setCurrentTxHash(null);
      } finally {
        setIsProcessing(false);
      }
    };
  
    const handleBet = async () => {
      if (!window.ethereum || !betAmount || !address) return;
      setIsProcessing(true);
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const amountInWei = ethers.parseEther(betAmount);
    
        // Vérification du solde pour ETH
        if (isEthBet) {
          const ethBalance = await provider.getBalance(address);
          if (ethBalance < amountInWei) {
            throw new Error("Insufficient ETH balance");
          }
        }
    
        const boxContract = new ethers.Contract(box.address, BOX_ABI, signer);
        setTransactionStatus('betting');
    
        let tx;
        if (isEthBet) {
          tx = await boxContract.createBet(selectedBetType === 'hunt', {
            value: amountInWei,
            gasLimit: 500000
          });
        } else {
          tx = await boxContract.createBetWithAmount(selectedBetType === 'hunt', amountInWei, {
            gasLimit: 500000
          });
        }
    
        setCurrentTxHash(tx.hash);
        await tx.wait();
    
        // Attendre confirmation de la transaction
        const receipt = await provider.getTransactionReceipt(tx.hash);
        if (receipt && receipt.status === 0) {
          throw new Error("Transaction failed");
        }
    
        setTransactionStatus('complete');
        await fetchBoxes();
    
      } catch (error: any) {
        console.error('Betting error:', error);
        setTransactionStatus('initial');
        // Afficher l'erreur à l'utilisateur de manière appropriée
        alert(error.message || "Transaction failed");
      } finally {
        setIsProcessing(false);
        // Ne pas reset immédiatement en cas d'erreur
        if (transactionStatus === 'complete') {
          setTimeout(() => resetBettingState(), 2000);
        }
      }
    };
  
    const resetBettingState = () => {
      setSelectedBetType(null);
      setActiveBetBox(null);
      setBetAmount('');
      setTransactionStatus('initial');
      setCurrentTxHash(null);
    };
  
    const validateAmount = (amount: string) => {
      if (!amount) return false;
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) return false;
      if (!isEthBet) return numAmount <= parseFloat(tokenBalance);
      return true;
    };
  
    if (!isActive) {
      return (
        <div className="grid grid-cols-2 gap-2 my-4">
          <button
            onClick={() => {
              setSelectedBetType('hunt');
              setActiveBetBox(box);
            }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            disabled={isProcessing}
          >
            🎯 Hunt
          </button>
          <button
            onClick={() => {
              setSelectedBetType('fish');
              setActiveBetBox(box);
            }}
            className="bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            disabled={isProcessing}
          >
            🎣 Fish
          </button>
        </div>
      );
    }
  
    return (
      <div className="betting-panel bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedBetType === 'hunt' ? '🎯' : '🎣'}</span>
            <span className="text-xl font-bold">{selectedBetType === 'hunt' ? 'Hunt' : 'Fish'}</span>
          </div>
          <button
            onClick={resetBettingState}
            className="text-gray-500 hover:text-gray-700"
          >
            Change
          </button>
        </div>
  
        {!isEthBet && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <span className="font-semibold text-blue-700">
              Balance: {parseFloat(tokenBalance).toFixed(4)} {box.tokenData.symbol}
            </span>
          </div>
        )}
  
        <div className="amount-section space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map(amount => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                className="bg-white py-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {amount}
              </button>
            ))}
          </div>
  
          <div className="relative">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg pr-20"
              placeholder={`Amount in ${box.tokenData.symbol || 'ETH'}`}
              min="0"
              step="0.000000000000000001"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-gray-500">
              {box.tokenData.symbol || 'ETH'}
            </span>
          </div>
        </div>
  
        {transactionStatus === 'initial' && (
          <div className="space-y-3">
            {isApprovalRequired && !isEthBet && (
              <button
                onClick={handleApproval}
                disabled={!validateAmount(betAmount) || isProcessing}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Approve {box.tokenData.symbol}
              </button>
            )}
            
            <button
              onClick={handleBet}
              disabled={!validateAmount(betAmount) || (isApprovalRequired && !isEthBet) || isProcessing}
              className={`
                w-full py-3 rounded-lg font-semibold text-white transition-all
                ${selectedBetType === 'hunt'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              Place Bet
            </button>
          </div>
        )}
  
        {transactionStatus !== 'initial' && (
          <div className="transaction-status bg-white rounded-lg p-4 space-y-3 border">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-blue-500 rounded-full" />
              <span className="font-medium text-gray-700">
                {transactionStatus === 'approving' && (
                  <span className="text-blue-600">Approving {box.tokenData.symbol}...</span>
                )}
                {transactionStatus === 'approved' && (
                  <span className="text-green-600">Approval confirmed!</span>
                )}
                {transactionStatus === 'betting' && (
                  <span className="text-blue-600">Placing bet...</span>
                )}
                {transactionStatus === 'complete' && (
                  <span className="text-green-600">Transaction complete!</span>
                )}
              </span>
            </div>
            
            {currentTxHash && (
              <a
                href={`https://basescan.org/tx/${currentTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm block truncate"
              >
                View on BaseScan →
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

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
        box.bets.forEach(bet => {
          uniquePlayers.add(bet.participant);
          const amount = BigInt(bet.amount);
          
          if (!box.tokenData.address) ethVolume += amount;
          else if (box.tokenData.symbol === 'KRILL') krillVolume += amount;
          else otherVolume += amount;
        });
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
          .filter(box => new Date(box.lastUpdated) >= cutoffDate)
          .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        
        setBoxes(filteredBoxes);
        setStats(calculateStats(filteredBoxes));
      }
    } catch (error) {
      console.error('Error fetching boxes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string): string => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const calculateHunterPercentage = (bets: Bet[]): number => {
    if (bets.length === 0) return 0;
    const hunters = bets.filter(bet => bet.prediction).length;
    return (hunters / bets.length) * 100;
  };

  const getFilteredBoxes = (boxes: Box[]) => {
    return boxes.filter(box => {
      const sportId = box.sportId as keyof SportsType;
      const hasSportFilter = Object.values(filters.sports).some(v => v);
      const sportMatch = !hasSportFilter || filters.sports[sportId];
      
      const isEth = !box.tokenData.address;
      const isKrill = box.tokenData.symbol === 'KRILL';
      const isCustomToken = box.tokenData.address?.toLowerCase() === filters.tokens.custom.toLowerCase();
      const hasTokenFilter = filters.tokens.ETH || filters.tokens.KRILL || filters.tokens.custom;
      const tokenMatch = !hasTokenFilter || 
                      (filters.tokens.ETH && isEth) ||
                      (filters.tokens.KRILL && isKrill) ||
                      (filters.tokens.custom && isCustomToken);
      
      const myGamesMatch = !filters.myGames || 
                        (address && box.bets.some(bet => 
                          bet.participant.toLowerCase() === address.toLowerCase()
                        ));
      
      return sportMatch && tokenMatch && myGamesMatch;
    });
  };

  useEffect(() => {
    fetchBoxes();
    const interval = setInterval(fetchBoxes, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setBotName(params.get("botName") || "");
    setUid(params.get("uid") || "");
    setCallbackEndpoint(params.get("callback") || "");
    const actionType = params.get("type") === "signature" ? "signature" : "transaction";
    setOperationType(actionType);

    const source = params.get("source");
    if (source) {
      fetch(source)
        .then(response => response.json())
        .then(data => {
          const error = getSchemaError(actionType, data);
          if (error) setSchemaError(error);
          else actionType === "signature" ? setSignMessageData(data) : setTransactionData(data);
        })
        .catch(setSchemaError);
    }
  }, []);

  return (
    <>
      {isConnected && !schemaError && <Account botName={botName} />}
      {!isConnected && !schemaError && <Connect />}

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
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          sports: {
                            ...prev.sports,
                            [sport]: e.target.checked
                          }
                        }))}
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
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        tokens: {
                          ETH: e.target.checked,
                          KRILL: false,
                          custom: ''
                        }
                      }))}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-2">ETH</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.tokens.KRILL}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        tokens: {
                          ETH: false,
                          KRILL: e.target.checked,
                          custom: ''
                        }
                      }))}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-2">KRILL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Custom Token Address"
                    value={filters.tokens.custom}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      tokens: {
                        ETH: false,
                        KRILL: false,
                        custom: e.target.value
                      }
                    }))}
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
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          myGames: e.target.checked
                        }))}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className="ml-2">🎮 My Games</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="boxes-container">
              {isLoading ? (
                <div className="loading">Loading boxes...</div>
              ) : (
                <div className="boxes-grid">
                  {getFilteredBoxes(boxes).map((box) => {
                    const hunterPercentage = calculateHunterPercentage(box.bets);
                    
                    return (
                      <div key={box.address} className="box-card">
                        {box.imageData && (
                          <div className="box-image-container">
                            <img 
                              src={`data:image/png;base64,${box.imageData}`}
                              alt={`${box.sportId} preview`}
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

                          <div className="total-amount-highlight">
                            <div className="amount-label">Total Pool</div>
                            <div className="amount-value">
                              {formatEther(BigInt(box.totalAmount || '0'))} {box.tokenData.symbol || 'ETH'}
                            </div>
                          </div>

                          {!box.isSettled && 
                          !box.sportData?.status?.toLowerCase().includes('live') && 
                          new Date(box.sportData?.scheduled || '').getTime() > Date.now() && (
                            isConnected ? <BettingSection box={box} /> : (
                              <div className="connect-notice p-4 text-center bg-gray-50 rounded-lg">
                                Connect wallet to place bets
                              </div>
                            )
                          )}

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
                              <span className={`status-badge ${box.isSettled ? 'settled' : 
                                box.sportData?.status === 'live' ? 'live' : 'active'}`}>
                                {box.isSettled ? '🔴 Settled' : 
                                box.sportData?.status === 'live' ? '🟡 Live' : '🟢 Active'}
                              </span>
                              <span className="status-badge">
                                {box.isSettled ? '🤖 ✅' : '🤖 ⏳'}
                              </span>
                              <span className="status-badge">
                                {box.isSettled ? '⚡ ✅' : '⚡ ⏳'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Transaction Components */}
        {isConnected && !schemaError && (transactionData || signMessageData) && (
          <>
            {operationType === "transaction" && transactionData && uid && (
              <>
                <div className="container">
                  <pre>{JSON.stringify(transactionData, null, 2)}</pre>
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
                  <pre>{JSON.stringify(signMessageData, null, 2)}</pre>
                </div>
                <SignMessage
                  uid={uid}
                  domain={signMessageData.domain}
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
            <div>Source doesn't match schema</div>
            <pre>{JSON.stringify(schemaError, null, 2)}</pre>
          </div>
        )}

        {callbackError && (
          <div className="container callbackError">
            <div>Error during callback request to {callbackEndpoint}</div>
            <pre>{JSON.stringify(callbackError, null, 2)}</pre>
          </div>
        )}
      </>
    );
}