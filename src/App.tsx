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
  status: {
    open: boolean;
    closed: boolean;
  };
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
      SOCCER: true, F1: true, MMA: true, NFL: true, BASKETBALL: true
    },
    tokens: {
      ETH: true,
      KRILL: true,
      custom: ''
    },
    status: {
      open: true,
      closed: true
    },
    myGames: false
  });

  // Betting states
  const [selectedBetType, setSelectedBetType] = useState<'hunt' | 'fish' | null>(null);
  const [activeBetBox, setActiveBetBox] = useState<Box | null>(null);

  const onCallbackError = (error: any) => {
    setCallbackError(error);
  };

  const getTotalAmount = (box: Box): string => {
    // Vérifier si c'est un token ETH (adresse nulle ou 0x000...)
    const isEthToken = !box.tokenData.address || box.tokenData.address === '0x0000000000000000000000000000000000000000';
    
    try {
      // Calculer le total des paris
      const total = box.bets.reduce((sum, bet) => {
        return sum + BigInt(bet.amount);
      }, BigInt(0));
      
      // Formater selon le type de token
      const formattedTotal = formatEther(total);
      return `${parseFloat(formattedTotal).toFixed(4)} ${isEthToken ? 'ETH' : box.tokenData.symbol}`;
    } catch (error) {
      console.error('Error calculating total amount:', error);
      return '0.0000';
    }
  };

  const BettingSection = ({ box }: { box: Box }) => {
    const isEthBet = !box.tokenData.address;
    const isActive = box === activeBetBox;
    const [tokenBalance, setTokenBalance] = useState<string>('0');
    const [tokenAllowance, setTokenAllowance] = useState<string>('0');
    const [isApprovalRequired, setIsApprovalRequired] = useState(false);
    const [ethBalance, setEthBalance] = useState<string>('0');
    const [customAmount, setCustomAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState<'initial' | 'approving' | 'approved' | 'betting' | 'complete'>('initial');
    const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);
    const handleBetError = (error: any) => {
      console.error('Betting error:', error);
      setTransactionStatus('initial');
      
      const errorMessage = error.message || "Transaction failed";
      if (errorMessage.includes("user rejected") || errorMessage.includes("User denied")) {
        alert("Transaction was rejected by your wallet");
      } else if (errorMessage.includes("insufficient funds")) {
        alert("Your balance is insufficient for this transaction");
      } else if (errorMessage.includes("gas")) {
        alert("Gas estimation failed. Please ensure you have enough ETH for gas fees");
      } else {
        alert(errorMessage);
      }
    };

    const resetBettingState = () => {
      setSelectedBetType(null);
      setActiveBetBox(null);
      setCustomAmount('');
      setTransactionStatus('initial');
      setCurrentTxHash(null);
    };
  
    const handleApproval = async () => {
      if (!window.ethereum || !customAmount || !address) return;
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
  
        const amountInWei = ethers.parseEther(customAmount);
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
  
    const getQuickAmounts = (isEthToken: boolean): string[] => {
      if (isEthToken) {
        return ['0.005', '0.01', '0.1', '0.5', '1'];
      }
      return ['5', '10', '25', '50', '100'];
    };
    
    // Fetch balances on mount
    useEffect(() => {
      const fetchBalances = async () => {
        if (!window.ethereum || !address) return;
        
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          // Always fetch ETH balance for gas estimation
          const baseEthBalance = await provider.getBalance(address);
          setEthBalance(ethers.formatEther(baseEthBalance));
          
          // Check if it's ETH (null address or 0x000...)
          const isEthToken = !box.tokenData.address || box.tokenData.address === '0x0000000000000000000000000000000000000000';
          
          // Only fetch token balances for non-ETH tokens
          if (!isEthToken && box.tokenData.address) {
            if (!ethers.isAddress(box.tokenData.address)) {
              console.warn('Invalid token address');
              return;
            }
            
            const code = await provider.getCode(box.tokenData.address);
            if (code === '0x') {
              console.warn('No contract at token address');
              return;
            }
            
            const tokenContract = new ethers.Contract(
              box.tokenData.address,
              ERC20_ABI,
              provider
            );

            const [balance, allowance] = await Promise.all([
              tokenContract.balanceOf(address),
              tokenContract.allowance(address, box.address)
            ]);
            
            setTokenBalance(ethers.formatEther(balance));
            setTokenAllowance(ethers.formatEther(allowance));
          } else {
            // For ETH, set token balance to ETH balance and max allowance
            setTokenBalance(ethers.formatEther(baseEthBalance));
            setTokenAllowance(ethers.MaxUint256.toString());
          }
        } catch (error) {
          console.error('Error fetching balances:', error);
        }
      };
      
      fetchBalances();
    }, [box.tokenData.address, address]);

    // Check approval requirements
    useEffect(() => {
      try {
        // Check if it's ETH (null address or 0x000...)
        const isEthToken = !box.tokenData.address || box.tokenData.address === '0x0000000000000000000000000000000000000000';
        
        // Never require approval for ETH
        if (isEthToken) {
          setIsApprovalRequired(false);
          return;
        }
        
        // Check approval for ERC20 tokens only if we have a custom amount
        if (customAmount) {
          const amountInWei = ethers.parseEther(customAmount);
          const currentAllowance = ethers.parseEther(tokenAllowance);
          setIsApprovalRequired(amountInWei > currentAllowance);
        }
      } catch (error) {
        console.warn('Invalid amount for approval check:', error);
      }
    }, [customAmount, tokenAllowance, box.tokenData.address]);
  
    const handleBet = async () => {
      if (!window.ethereum || !customAmount || !address) return;
      setIsProcessing(true);
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const amountInWei = ethers.parseEther(customAmount);
        const prediction = selectedBetType === 'hunt' ? "true" : "false";
    
        // Check if it's ETH (null address or 0x000...)
        const isEthToken = !box.tokenData.address || box.tokenData.address === '0x0000000000000000000000000000000000000000';
    
        setTransactionStatus('betting');
        const boxContract = new ethers.Contract(box.address, BOX_ABI, signer);
    
        if (isEthToken) {
          // Direct ETH transaction
          const tx = await boxContract.createBet(prediction, {
            value: amountInWei,
            gasLimit: 300000 // Fixed gas limit for ETH transactions
          });
          
          setCurrentTxHash(tx.hash);
          await tx.wait();
        } else {
          // ERC20 token transaction
          await handleERC20Bet(signer, prediction, amountInWei);
        }
    
        setTransactionStatus('complete');
        await fetchBoxes();
        
      } catch (error: any) {
        handleBetError(error);
      } finally {
        setIsProcessing(false);
        if (transactionStatus === 'complete') {
          setTimeout(resetBettingState, 2000);
        }
      }
    };
    
    // Fonction séparée pour gérer les paris en ERC20
    const handleERC20Bet = async (signer: ethers.Signer, prediction: string, amountInWei: bigint) => {
      const tokenContract = new ethers.Contract(
        box.tokenData.address!,
        ERC20_ABI,
        signer
      );
      
      if (isApprovalRequired) {
        setTransactionStatus('approving');
        const approveTx = await tokenContract.approve(box.address, amountInWei);
        setCurrentTxHash(approveTx.hash);
        await approveTx.wait();
      }
    
      setTransactionStatus('betting');
      const boxContract = new ethers.Contract(box.address, BOX_ABI, signer);
      const betTx = await boxContract.createBetWithAmount(
        prediction,
        amountInWei
      );
      
      setCurrentTxHash(betTx.hash);
      await betTx.wait();
    };
  
    // Dans le BettingSection, quand !isActive
    if (!isActive) {
      return (
        <div className="w-full mt-2 px-4"> {/* Ajout de padding horizontal */}
          <div className="space-y-3"> {/* Utilisation de space-y au lieu de flex et gap */}
            <button
              onClick={() => {
                setSelectedBetType('hunt');
                setActiveBetBox(box);
              }}
              className="hunt-button w-full h-14 font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transform transition-all disabled:opacity-50"
              disabled={isProcessing}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">🎯</span>
                <span className="text-lg">Hunt</span>
              </div>
            </button>
    
            <button
              onClick={() => {
                setSelectedBetType('fish');
                setActiveBetBox(box);
              }}
              className="fish-button w-full h-14 font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transform transition-all disabled:opacity-50"
              disabled={isProcessing}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">🎣</span>
                <span className="text-lg">Fish</span>
              </div>
            </button>
          </div>
        </div>
      );
    }
  
    // Betting interface
    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="space-y-4">
          {/* En-tête avec titre et bouton de retour */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {selectedBetType === 'hunt' ? '🎯' : '🎣'}
              </span>
              <span className="text-2xl font-bold">
                {selectedBetType === 'hunt' ? 'Hunt' : 'Fish'}
              </span>
            </div>
            <button
              onClick={resetBettingState}
              className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                selectedBetType === 'hunt' 
                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                  : 'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              ← Back
            </button>
          </div>
    
          {/* Affichage des soldes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!isEthBet && (
              <div className="bg-blue-50 p-3 rounded-lg"> {/* Réduction du padding */}
                <div className="text-xs text-blue-600 font-medium">Token Balance</div>
                <div className="text-base font-bold text-blue-700"> {/* Réduction de la taille du texte */}
                  {parseFloat(tokenBalance).toFixed(4)} {box.tokenData.symbol}
                </div>
              </div>
            )}
            <div className="bg-emerald-50 p-3 rounded-lg"> {/* Réduction du padding */}
              <div className="text-xs text-emerald-600 font-medium">ETH Balance</div>
              <div className="text-base font-bold text-emerald-700"> {/* Réduction de la taille du texte */}
                {parseFloat(ethBalance).toFixed(4)} ETH
              </div>
            </div>
          </div>
    
          {/* Input et montants prédéfinis améliorés */}
          <div className="space-y-6">
            {/* Input personnalisé en premier */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">
                  {isEthBet ? 'ETH' : box.tokenData.symbol}
                </span>
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={customAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setCustomAmount(value);
                  }
                }}
                className={`
                  w-full pl-16 pr-4 py-4 text-lg font-bold border-2 rounded-xl
                  ${selectedBetType === 'hunt' 
                    ? 'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500' 
                    : 'border-rose-200 focus:border-rose-500 focus:ring-rose-500'
                  }
                  focus:ring-2 focus:outline-none transition-all
                `}
                placeholder="Enter amount"
              />
            </div>
    
            {/* Montants prédéfinis avec les bonnes valeurs */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {getQuickAmounts(isEthBet).map(amount => (
                <button
                  key={amount}
                  onClick={() => setCustomAmount(amount)}
                  className={`
                    py-2 px-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap
                    ${customAmount === amount 
                      ? selectedBetType === 'hunt'
                        ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-2 border-rose-300'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  {amount} {isEthBet ? 'ETH' : box.tokenData.symbol}
                </button>
              ))}
            </div>
          </div>
    
          {/* Boutons d'action */}
          {transactionStatus === 'initial' ? (
            <>
              {isApprovalRequired && !isEthBet && (
                <button
                  onClick={handleApproval}
                  disabled={!customAmount || isProcessing}
                  className={`bet-button w-full py-4 mb-3 font-bold text-lg text-white rounded-xl transition-all ${
                    selectedBetType === 'hunt' ? 'hunt-type' : 'fish-type'
                  } disabled:opacity-50`}
                >
                  Approve {box.tokenData.symbol}
                </button>
              )}
              
              <button
                onClick={handleBet}
                disabled={!customAmount || (isApprovalRequired && !isEthBet) || isProcessing}
                className={`bet-button w-full py-4 font-bold text-lg text-white rounded-xl transition-all ${
                  selectedBetType === 'hunt' ? 'hunt-type' : 'fish-type'
                } disabled:opacity-50`}
              >
                Place Bet
              </button>
            </>
          ) : (
            <TransactionStatus 
              status={transactionStatus}
              tokenSymbol={box.tokenData.symbol}
              txHash={currentTxHash}
              type={selectedBetType}
            />
          )}
        </div>
      </div>
    );
  };


  
  const TransactionStatus = ({ 
    status, 
    tokenSymbol, 
    txHash,
    type 
  }: { 
    status: string;
    tokenSymbol?: string;
    txHash: string | null;
    type: 'hunt' | 'fish' | null;
  }) => (
    <div className="bg-white rounded-lg p-4 space-y-3 border">
      <div className="flex items-center gap-3">
        <div 
          className={`
            animate-spin h-5 w-5 border-2 border-t-transparent rounded-full
            ${type === 'hunt' 
              ? 'border-emerald-500' 
              : type === 'fish'
                ? 'border-rose-500'
                : 'border-blue-500'
            }
          `} 
        />
        <span className="font-medium">
          {status === 'approving' && (
            <span className={
              type === 'hunt' 
                ? 'text-emerald-600' 
                : type === 'fish'
                  ? 'text-rose-600'
                  : 'text-blue-600'
            }>
              Approving {tokenSymbol}...
            </span>
          )}
          {status === 'approved' && (
            <span className="text-green-600">Approval confirmed!</span>
          )}
          {status === 'betting' && (
            <span className={
              type === 'hunt' 
                ? 'text-emerald-600' 
                : type === 'fish'
                  ? 'text-rose-600'
                  : 'text-blue-600'
            }>
              Placing bet...
            </span>
          )}
          {status === 'complete' && (
            <span className="text-green-600">Transaction complete!</span>
          )}
        </span>
      </div>
      
      {txHash && (
        <a
          href={`https://basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            text-sm block truncate hover:underline
            ${type === 'hunt' 
              ? 'text-emerald-500 hover:text-emerald-600' 
              : type === 'fish'
                ? 'text-rose-500 hover:text-rose-600'
                : 'text-blue-500 hover:text-blue-600'
            }
          `}
        >
          View on BaseScan →
        </a>
      )}
    </div>
  );

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


  // Token change handlers
  const handleTokenChange = (tokenType: 'ETH' | 'KRILL', checked: boolean) => {
    setFilters((prev: Filters) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        [tokenType]: checked,
        // Ne pas réinitialiser l'autre token quand on en sélectionne un
        // Permettre la sélection multiple
      }
    }));
  };
  
  const handleCustomTokenChange = (value: string) => {
    setFilters((prev: Filters) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        custom: value,
        // Garder les autres sélections de token quand on entre une adresse personnalisée
        ETH: prev.tokens.ETH,
        KRILL: prev.tokens.KRILL
      }
    }));
  };

  const getFilteredBoxes = (boxes: Box[]) => {
    if (!Array.isArray(boxes)) return [];
    
    return boxes.filter(box => {
      if (!box || !box.sportData || !box.tokenData) return false;
      
      try {
        // Sport filtering
        const sportId = String(box.sportId || '').toUpperCase();
        const sportMatch = filters.sports[sportId as keyof SportsType];
        
        // Token filtering - Allow multiple token selections
        const isEth = !box.tokenData.address || box.tokenData.address === '0x0000000000000000000000000000000000000000';
        const isKrill = box.tokenData.symbol === 'KRILL';
        const customAddr = (filters.tokens.custom || '').toLowerCase();
        const boxAddr = (box.tokenData.address || '').toLowerCase();
        const hasCustomToken = customAddr !== '' && boxAddr === customAddr;
  
        // Allow multiple token selections
        const tokenMatch = (filters.tokens.ETH && isEth) ||
                          (filters.tokens.KRILL && isKrill) ||
                          (customAddr !== '' && hasCustomToken);
      
        // Game ownership filtering
        const myGamesMatch = !filters.myGames || (
          address && 
          Array.isArray(box.bets) && 
          box.bets.some(bet => 
            bet && 
            typeof bet.participant === 'string' && 
            bet.participant.toLowerCase() === address.toLowerCase()
          )
        );
      
        // Status filtering
        const scheduledTime = box.sportData?.scheduled ? new Date(box.sportData.scheduled).getTime() : 0;
        const isBoxOpen = scheduledTime > Date.now() && !box.isSettled;
        const isBoxClosed = box.isSettled || scheduledTime <= Date.now();
        
        const statusMatch = (filters.status.open && isBoxOpen) ||
                         (filters.status.closed && isBoxClosed);
  
        return sportMatch && tokenMatch && myGamesMatch && statusMatch;
        
      } catch (error) {
        console.error('Error filtering box:', box, error);
        return false;
      }
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
                        onChange={(e) => setFilters((prev: Filters) => ({
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
                      onChange={(e) => handleTokenChange('ETH', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-2">ETH</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.tokens.KRILL}
                      onChange={(e) => handleTokenChange('KRILL', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-2">KRILL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Custom Token Address"
                    value={filters.tokens.custom}
                    onChange={(e) => handleCustomTokenChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
              </div>


              <div className="filter-group">
                <span className="filter-label">Status</span>
                <div className="filter-options">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.open}
                      onChange={(e) => setFilters((prev: Filters) => ({
                        ...prev,
                        status: { ...prev.status, open: e.target.checked }
                      }))}
                      className="form-checkbox h-4 w-4 text-emerald-600 rounded border-gray-300"
                    />
                    <span className="ml-2">🟢 Open</span>
                  </label>
                  <label className="inline-flex items-center ml-4">
                    <input
                      type="checkbox"
                      checked={filters.status.closed}
                      onChange={(e) => setFilters((prev: Filters) => ({
                        ...prev,
                        status: { ...prev.status, closed: e.target.checked }
                      }))}
                      className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300"
                    />
                    <span className="ml-2">🔴 Closed</span>
                  </label>
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
                        onChange={(e) => setFilters((prev: Filters) => ({
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
                            <div className={`amount-value ${getTotalAmount(box) !== '0.0000' ? 'animate-pulse' : ''}`}>
                              {getTotalAmount(box)}
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
                              <span className={`status-badge ${
                                box.isSettled || new Date(box.sportData?.scheduled || '').getTime() <= Date.now() 
                                  ? 'settled' 
                                  : 'active'
                              }`}>
                                {box.isSettled || new Date(box.sportData?.scheduled || '').getTime() <= Date.now() 
                                  ? '🔴 Closed' 
                                  : '🟢 Open'
                                }
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