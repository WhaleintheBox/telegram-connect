import { useAccount } from 'wagmi';
import { WriteContract, WriteContractData } from './components/WriteContract';
import { SignMessage, SignMessageProps } from './components/SignMessage';
import { ethers } from 'ethers';
import { Account } from './components/Account';
import { Connect } from './components/Connect';
import EventDetailsPopup from './components/EventDetailsPopup';
import { getSchemaError, sendEvent } from './utils';
import { formatEther } from 'viem';
import { ERC20_ABI, BOX_ABI } from './constants/contracts';
import { useCache } from './components/cacheService';
import { useState, useEffect, useCallback } from 'react';  // Ajout de useCallback
import { useConnectModal } from './Context'; 
import {  Banner } from './components/banner';
import DisqusChatPanel from './components/DisqusChatPanel';
import { ConnectionData, connectionDataSchema } from './utils';
import NavigationTabs from './components/NavigationTabs';

type SportsType = {
  [key in 'SOCCER' | 'F1' | 'MMA' | 'NFL' | 'BASKETBALL']: boolean;
};

type SortOption = 'latest' | 'trending' | 'new';

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

interface QuickAmount {
  value: string;
  display: string;
}
const SPORT_EMOJIS: Record<keyof SportsType, string> = {
  SOCCER: '⚽', F1: '🏎️', MMA: '🥊', NFL: '🏈', BASKETBALL: '🏀'
};

// Types communs
export interface Status {
  long: string;
  short: string;
}

// Constantes de statut normalisées
const STATUS_MAP = {
  SOCCER: {
    'TBD': { long: 'To Be Determined', short: 'TBD' },
    'NS': { long: 'Not Started', short: 'NS' },
    'LIVE': { long: 'Live', short: 'LIVE' },
    'HT': { long: 'Halftime', short: 'HT' },
    'FT': { long: 'Finished', short: 'FT' },
    'AET': { long: 'Finished After Extra Time', short: 'AET' },
    'PEN': { long: 'Finished After Penalties', short: 'PEN' },
    'SUSP': { long: 'Suspended', short: 'SUSP' },
    'INT': { long: 'Interrupted', short: 'INT' },
    'PST': { long: 'Postponed', short: 'PST' },
    'CANC': { long: 'Cancelled', short: 'CANC' }
  },
  BASKETBALL: {
    'NS': { long: 'Not Started', short: 'NS' },
    'LIVE': { long: 'Live', short: 'LIVE' },
    'HT': { long: 'Halftime', short: 'HT' },
    'FT': { long: 'Finished', short: 'FT' },
    'SUSP': { long: 'Suspended', short: 'SUSP' },
    'INT': { long: 'Interrupted', short: 'INT' },
    'PST': { long: 'Postponed', short: 'PST' },
    'CANC': { long: 'Cancelled', short: 'CANC' }
  },
  NFL: {
    // Phase pré-match
    'NS': { long: 'Not Started', short: 'NS' },
    'SCHEDULED': { long: 'Scheduled', short: 'SCH' },
    'PST': { long: 'Postponed', short: 'PST' },
    'CANC': { long: 'Cancelled', short: 'CANC' },
    
    // Phases en cours
    'Q1': { long: 'First Quarter', short: 'Q1' }, 
    'Q2': { long: 'Second Quarter', short: 'Q2' },
    'Q3': { long: 'Third Quarter', short: 'Q3' },
    'Q4': { long: 'Fourth Quarter', short: 'Q4' },
    'HT': { long: 'Halftime', short: 'HT' },
    'OT': { long: 'Overtime', short: 'OT' },
    '2OT': { long: 'Double Overtime', short: '2OT' },
    
    // Phases intermédiaires
    'SUSP': { long: 'Suspended', short: 'SUSP' },
    'INT': { long: 'Interrupted', short: 'INT' },
    'DEL': { long: 'Delayed', short: 'DEL' },
    
    // Phases finales
    'FT': { long: 'Finished', short: 'FT' },
    'AOT': { long: 'After Overtime', short: 'AOT' },
    'ABANDONED': { long: 'Abandoned', short: 'ABD' }
  },
  
  MMA: {
    'NS': {'long': 'Scheduled', 'short': 'SCH'},
    'IN': {'long': 'Live', 'short': 'LIVE'},
    'PF': {'long': 'Live', 'short': 'LIVE'},
    'LIVE': {'long': 'Live', 'short': 'LIVE'},
    'WO': {'long': 'Live', 'short': 'LIVE'},
    'EOR': {'long': 'Live', 'short': 'LIVE'},
    'FT': {'long': 'Finished', 'short': 'FIN'},
    'CANC': {'long': 'Cancelled', 'short': 'CANC'},
    'PST': {'long': 'Postponed', 'short': 'PST'}
  },
  F1: {
    'UPCOMING': { long: 'Scheduled', short: 'SCH' },
    'INPROGRESS': { long: 'Live', short: 'LIVE' },
    'FINISHED': { long: 'Finished', short: 'FIN' },
    'CANCELLED': { long: 'Cancelled', short: 'CANC' },
    'POSTPONED': { long: 'Postponed', short: 'PST' }
  }
} as const;


export const ADDRESS_REGEX = /(0x[a-fA-F0-9]{40})/g;

// Fonction utilitaire pour normaliser le status
export const normalizeStatus = (status: any, sport: keyof typeof STATUS_MAP = 'SOCCER'): Status => {
  if (!status) {
    return { long: 'Unknown', short: 'UNK' };
  }

  // Si le status est déjà au bon format
  if (typeof status === 'object' && 'long' in status && 'short' in status) {
    return status as Status;
  }

  const statusStr = String(status).toUpperCase();
  const sportMap = STATUS_MAP[sport];
  
  // Recherche dans la map du sport
  const mappedStatus = sportMap[statusStr as keyof typeof sportMap];
  if (mappedStatus) {
    return mappedStatus;
  }

  // Status non reconnu
  return {
    long: String(status),
    short: String(status).substring(0, 3)
  };
};

// Hook personnalisé pour la gestion des statuts
export const useEventStatus = (sportData?: { status?: any, scheduled?: string }) => {
  const getEventStatus = () => {
    if (!sportData) return normalizeStatus(null);

    const now = new Date();
    const scheduled = sportData.scheduled ? new Date(sportData.scheduled) : null;

    // Si l'événement n'a pas encore commencé
    if (scheduled && scheduled > now) {
      return { long: 'Scheduled', short: 'SCH' };
    }

    return normalizeStatus(sportData.status);
  };

  return getEventStatus();
};

// Composant pour l'affichage du statut
export const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status.short) {
      // Live statuses - Green theme
      case 'LIVE':
      case 'Q1':
      case 'Q2':
      case 'Q3':
      case 'Q4':
      case 'IN':
      case 'PF':
      case 'EOR':
      case 'WO':
      case 'INPROGRESS':
      case 'HT':
      case '2OT': // Ajout pour NFL
      case 'AOT': // Ajout pour NFL
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      
      // Finished statuses - Gray theme
      case 'FT':
      case 'FIN':
      case 'AET':
      case 'OT':
      case 'PEN':
      case 'FINISHED':
      case 'ABD': // Ajout pour NFL (Abandoned)
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      
      // Cancelled/Postponed statuses - Red theme
      case 'CANC':
      case 'PST':
      case 'CANCELLED':
      case 'POSTPONED':
      case 'SUSP':
      case 'INT':
      case 'DEL': // Ajout pour NFL (Delayed)
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      
      // Scheduled/Not Started statuses - Blue theme
      case 'NS':
      case 'TBD':
      case 'SCH':
      case 'UPCOMING':
      case 'SCHEDULED': // Ajout pour NFL
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      
      // Default fallback
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2 border ${getStatusStyle()}`}>
      {status.short === 'LIVE' ? '🔴' : '⚪'} {status.long}
    </div>
  );
};

interface SportDataType {
  tournament?: string;
  status?: {  // Modifier le type de status
      long: string;
      short: string;
  };
  formattedStatus?: string;
  scheduled?: string;
  venue?: string;
  match_id?: string;
  // Teams (Soccer, NBA, NFL)
  home_team?: string;
  away_team?: string;
  home_score?: number;
  away_score?: number;
  scores?: {
      home?: { current: number; total: number };
      away?: { current: number; total: number };
  };
  // F1 specific
  circuit?: {
      name?: string;
      length?: string;
      laps?: number;
      lap_record?: string;
  };
  location_details?: {
      city?: string;
      country?: string;
  };
  season?: string;
  round?: string;
  sprint?: boolean;
  weather?: {
      temperature?: number;
      description?: string;
  };
  // MMA specific
  fighter1?: string;
  fighter2?: string;
  weight_class?: string;
  rounds?: number;
  is_main?: boolean;
  method?: string;
  // NFL specific
  week?: number | string;
  location?: string;
  totalBets?: number;
  uniqueBettors?: number;
  averageBetSize?: number;
  largestBet?: number;
  recentActivity?: Array<{
      type: 'hunt' | 'fish';
      amount: number;
      timestamp: string;
  }>;
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
  bets: Bet[];
  isSettled: boolean;
  outcome?: boolean; // Ajouter cette ligne
  totalAmount: string;
  tokenData: TokenData;
  lastUpdated: string;
  imageData?: string;
  initialEvents: Array<{who: string; prediction: string}>;
  timeRemaining?: number;
  isCancelled: boolean;
  metadata?: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
  sportData: SportDataType & {  // <-- Maintenant c'est SportDataType
    formattedStatus?: string;
    timeUntilStart?: number;
  };
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
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const { cacheData, updateCache, updatedBoxes, setUpdatedBoxes, isLoading: cacheLoading } = useCache();

  

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
    const { executeMobileTransaction, executeMobileTokenApproval } = useConnectModal();
    const { address } = useAccount();
    const [winningsAmount, setWinningsAmount] = useState<string>('0');
    const [hasUserClaimed, setHasUserClaimed] = useState(false);
    const isEthBet = !box.tokenData.address || box.tokenData.address === '0x0000000000000000000000000000000000000000';
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
        const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
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
  
    const getQuickAmounts = (isEthToken: boolean, symbol: string): QuickAmount[] => {
      if (isEthToken) {
        return [
          { value: '0.0025', display: '0.0025 ETH' },
          { value: '0.005', display: '0.005 ETH' },
          { value: '0.01', display: '0.01 ETH' },
          { value: '0.025', display: '0.025 ETH' },
          { value: '0.05', display: '0.05 ETH' }
        ];
      }
      // Pour les tokens ERC20
      return [
        { value: '5', display: `5 ${symbol}` },
        { value: '10', display: `10 ${symbol}` }, 
        { value: '25', display: `25 ${symbol}` },
        { value: '50', display: `50 ${symbol}` },
        { value: '100', display: `100 ${symbol}` }
      ];
    };
    
    const QuickAmountButton = ({ 
      amount, 
      isSelected, 
      onClick, 
      betType 
    }: { 
      amount: QuickAmount; 
      isSelected: boolean; 
      onClick: () => void; 
      betType: 'hunt' | 'fish' | null;
    }) => (
      <button
        onClick={onClick}
        className={`
          quick-amount-button
          ${isSelected ? `selected ${betType}` : ''}
        `}
      >
        {amount.display}
      </button>
    );
    
    
    // Fetch balances on mount
    useEffect(() => {
      const fetchBalances = async () => {
        if (!window.ethereum || !address) return;
        
        try {
          const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
          
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
  
    useEffect(() => {
      const checkWinnings = async () => {
        // Check aussi quand la box est cancelled
        if (!window.ethereum || !address || (!box.isSettled && !box.isCancelled)) return;
        try {
          const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
          const boxContract = new ethers.Contract(box.address, BOX_ABI, provider);
          
          const winnings = await boxContract.getWinningsToClaim(address);
          setWinningsAmount(ethers.formatEther(winnings));
          
          const claimedAmount = await boxContract.getTotalWinningsClaimed(address);
          setHasUserClaimed(claimedAmount > 0);
          
        } catch (error) {
          console.error('Error checking winnings:', error);
        }
      };
      
      checkWinnings();
    }, [address, box.address, box.isSettled, box.isCancelled]); // Add box.isCancelled to dependencies
    
    const handleClaim = async () => {
      if (!window.ethereum || !address) return;
      setIsProcessing(true);
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
        const signer = await provider.getSigner();
        const boxContract = new ethers.Contract(box.address, BOX_ABI, signer);
        
        const tx = await boxContract.claimWinnings();
        await tx.wait();
        
        setHasUserClaimed(true);
        setWinningsAmount('0');
        
      } catch (error: any) { // Spécifier le type 'any' pour l'erreur
        console.error('Error claiming winnings:', error);
        const errorMessage = error.message || "Transaction failed";
        if (errorMessage.includes("user rejected")) {
          alert("Transaction was rejected by your wallet");
        } else {
          alert(errorMessage);
        }
      } finally {
        setIsProcessing(false);
      }
    };
  
    const handleBet = async () => {
      if (!window.ethereum || !customAmount || !address) return;
      setIsProcessing(true);
      
      try {
        const amountInWei = ethers.parseEther(customAmount);
        const prediction = selectedBetType === 'hunt' ? "true" : "false";
        const isEthToken = !box.tokenData.address || box.tokenData.address === '0x0000000000000000000000000000000000000000';
    
        setTransactionStatus('betting');
    
        if (isEthToken) {
          const tx = await executeMobileTransaction({
            to: box.address,
            data: new ethers.Interface(BOX_ABI).encodeFunctionData('createBet', [prediction]),
            value: amountInWei.toString()
          });
          
          setCurrentTxHash(tx.hash);
          await tx.wait();
        } else {
          await handleERC20Bet(prediction, amountInWei);
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
    
    const handleERC20Bet = async (prediction: string, amountInWei: bigint) => {
      if (isApprovalRequired) {
        setTransactionStatus('approving');
        const approveTx = await executeMobileTokenApproval(
          box.tokenData.address!,
          box.address,
          amountInWei.toString(),
          ERC20_ABI
        );
        setCurrentTxHash(approveTx.hash);
        await approveTx.wait();
      }
    
      setTransactionStatus('betting');
      const tx = await executeMobileTransaction({
        to: box.address,
        data: new ethers.Interface(BOX_ABI).encodeFunctionData('createBetWithAmount', [
          prediction,
          amountInWei.toString()
        ])
      });
      
      setCurrentTxHash(tx.hash);
      await tx.wait();
    };

    if (box.isCancelled) {
      // Vérifier si l'utilisateur a participé à cette box
      const userBet = box.bets.find(bet => 
        bet.participant.toLowerCase() === address?.toLowerCase()
      );
      
      return (
        <div className="flex gap-2 px-4 pt-2 pb-4">
          {userBet ? (
            <button
              onClick={handleClaim}
              disabled={isProcessing || hasUserClaimed}
              className={`w-full py-3 font-bold rounded-xl transition-all
                ${!hasUserClaimed
                  ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              {isProcessing 
                ? '⏳ PROCESSING...'
                : hasUserClaimed
                  ? '✅ REFUND CLAIMED'
                  : parseFloat(winningsAmount) > 0
                    ? `🤑 CLAIM ${parseFloat(winningsAmount).toFixed(4)} ${box.tokenData.symbol}`
                    : '💰 CLAIM REFUND'
              }
            </button>
          ) : (
            <div className="w-full py-3 text-center bg-red-50 text-red-800 font-semibold rounded-xl">
              ❌ Box Cancelled
            </div>
          )}
        </div>
      );
    }
  
    if (!isActive) {
      // Si le match est en direct - Modifier pour utiliser la nouvelle structure de status
      if (['LIVE', 'HT', 'Q1', 'Q2', 'Q3', 'Q4', 'IN', 'PF', 'WO', 'EOR', 'INPROGRESS', '2OT', 'OT'].includes(box.sportData?.status?.short || ''))  {
        return (
          <div className="flex gap-2 px-4 pt-2 pb-4">
            <div className="w-full py-3 text-center bg-yellow-50 text-yellow-800 font-semibold rounded-xl">
              🎥 Game is Live
            </div>
          </div>
        );
      }
    
      // Vérifier si la box est résolue
      if (box.isSettled || 
        ['FT', 'AET', 'PEN', 'FIN', 'FINISHED', 'AOT', 'ABD'].includes(box.sportData?.status?.short || '')) {
        if (hasUserClaimed) {
          return (
            <div className="flex gap-2 px-4 pt-2 pb-4">
              <div className="w-full py-3 text-center bg-gray-100 text-gray-500 font-semibold rounded-xl">
                ✅ REWARD CLAIMED
              </div>
            </div>
          );
        }
    
        const userBet = box.bets.find(bet => 
          bet.participant.toLowerCase() === address?.toLowerCase()
        );
        const hasWon = userBet && userBet.prediction === box.outcome;
    
        return (
          <div className="flex gap-2 px-4 pt-2 pb-4">
            <button
              onClick={hasWon && parseFloat(winningsAmount) > 0 ? handleClaim : undefined}
              disabled={!hasWon || parseFloat(winningsAmount) <= 0 || isProcessing}
              className={`w-full py-3 font-bold rounded-xl transition-all
                ${hasWon && parseFloat(winningsAmount) > 0
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              {isProcessing 
                ? '⏳ PROCESSING...'
                : hasWon && parseFloat(winningsAmount) > 0
                  ? `🤑 CLAIM ${parseFloat(winningsAmount).toFixed(4)} ${box.tokenData.symbol}`
                  : '❌ NO REWARD TO CLAIM'
              }
            </button>
          </div>
        );
      }
    
      // Vérifier si le match est terminé mais non résolu
      const isScheduled = box.sportData?.scheduled && new Date(box.sportData.scheduled).getTime() <= Date.now();
      const isFinished = ['FT', 'AET', 'PEN', 'FIN', 'FINISHED', 'AOT', 'ABD'].includes(box.sportData?.status?.short || '');
      
      if (isScheduled || isFinished) {
        return (
          <div className="flex gap-2 px-4 pt-2 pb-4">
            <button 
              disabled
              className="w-full py-3 font-bold rounded-xl transition-all bg-gray-200 text-gray-500 cursor-not-allowed"
            >
              <span className="inline-block animate-spin">⏳</span>
              <span className="ml-2">WAITING FOR SETTLEMENT ⚠️</span>
            </button>
          </div>
        );
      }

      if (['SUSP', 'INT', 'PST', 'DEL'].includes(box.sportData?.status?.short || '')) {
        return (
          <div className="flex gap-2 px-4 pt-2 pb-4">
            <div className="w-full py-3 text-center bg-orange-50 text-orange-800 font-semibold rounded-xl">
              ⚠️ Game Interrupted
            </div>
          </div>
        );
      }

        // Ne montrer les boutons Hunt/Fish que si la box est vraiment ouverte
      const isBoxOpen = box.sportData?.status?.short === 'SCH' || 
                        box.sportData?.status?.short === 'NS' || 
                        box.sportData?.status?.short === 'TBD' || 
                        box.sportData?.status?.short === 'UPCOMING' || 
                        box.sportData?.status?.short === 'SCHEDULED' ||  // Ajouter TBD
                        !box.isSettled && !box.isCancelled && new Date(box.sportData?.scheduled || '').getTime() > Date.now();

      if (!isBoxOpen) {
        return (
          <div className="flex gap-2 px-4 pt-2 pb-4">
            <div className="w-full py-3 text-center bg-gray-100 text-gray-500 font-semibold rounded-xl">
              ⚠️ Box Unavailable
            </div>
          </div>
        );
      }

      // Box ouverte - Afficher les boutons Hunt/Fish normaux
      return (
        <div className="flex gap-2 px-4 pt-2 pb-4">
          <button
            onClick={() => {
              setSelectedBetType('hunt');
              setActiveBetBox(box);
            }}
            className="hunt-button h-14 font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transform transition-all flex-1"
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
            className="fish-button h-14 font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transform transition-all flex-1"
            disabled={isProcessing}
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🎣</span>
              <span className="text-lg">Fish</span>
            </div>
          </button>
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
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-2 rounded-lg ${selectedBetType === 'hunt' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <div className={`text-xs font-medium ${selectedBetType === 'hunt' ? 'text-emerald-600' : 'text-rose-600'}`}>
                Available Balance
              </div>
              <div className={`text-base font-bold ${selectedBetType === 'hunt' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isEthBet 
                  ? `${parseFloat(ethBalance).toFixed(4)} ETH`
                  : `${parseFloat(tokenBalance).toFixed(4)} ${box.tokenData.symbol}`
                }
              </div>
            </div>
            {!isEthBet && (
              <div className="bg-gray-50 p-2 rounded-lg">
                <div className="text-xs text-gray-600 font-medium">Gas Balance</div>
                <div className="text-base font-bold text-gray-700">
                  {parseFloat(ethBalance).toFixed(4)} ETH
                </div>
              </div>
            )}
          </div>
    
          {/* Section de bet */}
          <div className="space-y-4 mt-6">
            {/* Input amount avec label */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                selectedBetType === 'hunt' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                Enter amount
              </label>
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
                    w-full pl-16 pr-4 py-3 text-lg font-bold border-2 rounded-xl
                    ${selectedBetType === 'hunt' 
                      ? 'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500' 
                      : 'border-rose-200 focus:border-rose-500 focus:ring-rose-500'
                    }
                    focus:ring-2 focus:outline-none transition-all
                  `}
                  placeholder="0.0"
                />
              </div>
            </div>
    
            {/* Quick amounts */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                selectedBetType === 'hunt' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {getQuickAmounts(isEthBet, box.tokenData.symbol).map(amount => (
                  <QuickAmountButton
                    key={amount.value}
                    amount={amount}
                    isSelected={customAmount === amount.value}
                    onClick={() => setCustomAmount(amount.value)}
                    betType={selectedBetType}
                  />
                ))}
              </div>
            </div>
    
            {/* Action buttons */}
            <div className="pt-4">
              {transactionStatus === 'initial' ? (
                <>
                  {isApprovalRequired && !isEthBet && (
                    <button
                      onClick={handleApproval}
                      disabled={!customAmount || isProcessing}
                      className={`w-full py-3 mb-2 font-bold text-base text-white rounded-xl transition-all ${
                        selectedBetType === 'hunt' 
                          ? 'bg-emerald-500 hover:bg-emerald-600' 
                          : 'bg-rose-500 hover:bg-rose-600'
                      } disabled:opacity-50`}
                    >
                      Approve {box.tokenData.symbol}
                    </button>
                  )}
                  
                  <button
                    onClick={handleBet}
                    disabled={!customAmount || (isApprovalRequired && !isEthBet) || isProcessing}
                    className={`w-full py-3 font-bold text-base text-white rounded-xl transition-all ${
                      selectedBetType === 'hunt' 
                        ? 'bg-emerald-500 hover:bg-emerald-600' 
                        : 'bg-rose-500 hover:bg-rose-600'
                    } disabled:opacity-50`}
                  >
                    Place {selectedBetType === 'hunt' ? 'Hunt' : 'Fish'} Bet
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

  const fetchBoxes = useCallback(async () => {
    try {
      const response = await fetch('https://witbbot-638008614172.us-central1.run.app/boxes');
      const data = await response.json() as ApiResponse;
      
      if (data.success && Array.isArray(data.boxes)) {
        const cutoffDate = new Date('2024-11-20');
        const newUpdatedBoxes = new Set<string>();
        const newCacheData = { ...cacheData };
        
        data.boxes.forEach(box => {
          if (new Date(box.lastUpdated) >= cutoffDate) {
            const existingBox = newCacheData[box.address];
            if (existingBox) {
              if (new Date(box.lastUpdated) > new Date(existingBox.lastUpdated)) {
                newUpdatedBoxes.add(box.address);
                newCacheData[box.address] = box;
              }
            } else {
              newCacheData[box.address] = box;
            }
          }
        });
        
        setUpdatedBoxes(newUpdatedBoxes);
        await updateCache(newCacheData);
        
        setTimeout(() => {
          setUpdatedBoxes(new Set());
        }, 2000);
        
        const filteredBoxes = Object.values(newCacheData)
          .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        
        setBoxes(filteredBoxes);
        setStats(calculateStats(filteredBoxes));
      }
    } catch (error) {
      console.error('Error fetching boxes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cacheData, updateCache, setUpdatedBoxes]); // Ajoutez les dépendances ici

  useEffect(() => {
    fetchBoxes();
    const interval = setInterval(fetchBoxes, 30000);
    return () => clearInterval(interval);
  }, [fetchBoxes]); 

  const formatAddress = (address: string): string => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const calculateHunterPercentage = (bets: Bet[]): number => {
    if (bets.length === 0) return 0;
    const hunters = bets.filter(bet => bet.prediction).length;
    return (hunters / bets.length) * 100;
  };

  const handleTokenChange = (tokenType: 'ETH' | 'KRILL', checked: boolean) => {
    setFilters((prev: Filters) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        [tokenType]: checked,
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
    const NFL_SPORT_ID = 'NFL';

    let filteredBoxes = boxes.filter(box => {
      if (!box || !box.sportData || !box.tokenData) return false;

      try {
        // Sport filtering
        const sportId = String(box.sportId || '').toUpperCase();
        const sportMatch = sportId === NFL_SPORT_ID ? 
          filters.sports[NFL_SPORT_ID] : 
          filters.sports[sportId as keyof SportsType];

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
        const isBoxOpen = box.timeRemaining && box.timeRemaining > 0 && !box.isSettled;
        const isBoxClosed = box.isSettled || scheduledTime <= Date.now();
        
        const statusMatch = (filters.status.open && isBoxOpen) ||
                         (filters.status.closed && isBoxClosed);
  
        return sportMatch && tokenMatch && myGamesMatch && statusMatch;
        
      } catch (error) {
        console.error('Error filtering box:', box, error);
        return false;
      }
    });
    return filteredBoxes.sort((a, b) => {
      switch (sortOption) {
        case 'latest':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'trending':
          const volumeA = a.bets.reduce((sum, bet) => sum + BigInt(bet.amount), BigInt(0));
          const volumeB = b.bets.reduce((sum, bet) => sum + BigInt(bet.amount), BigInt(0));
          return Number(volumeB - volumeA);
        case 'new':
          return new Date(b.metadata?.createdAt || 0).getTime() - 
                 new Date(a.metadata?.createdAt || 0).getTime();
        default:
          return 0;
      }
    });
  };



  const handleSendData = useCallback(async () => {
    if (!address) {
      console.error('No wallet address available');
      return;
    }
  
    console.log('Starting connection process...', { address, uid, callbackEndpoint });
  
    try {
      const connectionData: ConnectionData = {
        type: 'connect_wallet',
        address: address,
        connect: true
      };
  
      // Vérification du schéma
      const parseResult = connectionDataSchema.safeParse(connectionData);
      if (!parseResult.success) {
        console.error('Validation error:', parseResult.error);
        return;
      }
  
      if (!uid || !callbackEndpoint) {
        console.error('Missing uid or callback endpoint');
        return;
      }
  
      // URL directe vers le wallet-connect endpoint
      const endpoint = 'https://witbbot-638008614172.us-central1.run.app/wallet-connect';
      console.log('Sending to endpoint:', endpoint);
  
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...parseResult.data,
          uid
        })
      });
  
      console.log('Connection request sent successfully');
    } catch (error) {
      console.error('Connection error:', error);
    }
  }, [address, uid, callbackEndpoint]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
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
      <Banner />
      {isConnected && !schemaError ? (
        <Account 
          myGames={filters.myGames} 
          onToggleMyGames={() => setFilters(prev => ({
            ...prev,
            myGames: !prev.myGames
          }))} 
        />
      ) : (
        <Connect 
          uid={uid || ''} 
          callbackEndpoint={callbackEndpoint || ''} 
          sendEvent={(data: ConnectionData) => {
            if (uid && callbackEndpoint) {
              const parseResult = connectionDataSchema.safeParse(data);
              if (!parseResult.success) {
                console.error('Validation error:', parseResult.error);
                onCallbackError({
                  status: 400,
                  text: 'Invalid connection data',
                  errors: parseResult.error.errors
                });
                return;
              }
              sendEvent(uid, callbackEndpoint, onCallbackError, parseResult.data);
            }
          }}
        />
      )}
      <div style={{ margin: '16px 0', textAlign: 'center' }}>
        <button 
          onClick={handleSendData}
          style={{
            background: '#0088cc',
            color: '#fff',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Connect to bot
        </button>
      </div>
      {(!transactionData && !signMessageData) && (
        <NavigationTabs>
        <>
          {/* Stats Panel */}
          <div className="stats-container">
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
            {(isLoading || cacheLoading) ? (
              <div className="loading">Loading boxes...</div>
            ) : (
              <>
                <div className="sort-buttons">
                  <button
                    onClick={() => setSortOption('latest')}
                    className={`sort-button ${sortOption === 'latest' ? 'active' : ''}`}
                  >
                    Latest Updates ⏱️
                  </button>
                  <button
                    onClick={() => setSortOption('trending')}
                    className={`sort-button ${sortOption === 'trending' ? 'active' : ''}`}
                  >
                    Trending 🔥
                  </button>
                  <button
                    onClick={() => setSortOption('new')}
                    className={`sort-button ${sortOption === 'new' ? 'active' : ''}`}
                  >
                    Just Added 🎯
                  </button>
                </div>
                <div className="boxes-grid">
                  {getFilteredBoxes(boxes).map((box) => {
                    const hunterPercentage = calculateHunterPercentage(box.bets);
                    const isUpdated = updatedBoxes.has(box.address);
                    
                    return (
                      <div 
                        key={box.address} 
                        className={`box-card ${isUpdated ? 'box-updated' : ''}`}
                      >
                        {box.imageData && (
                          <div className="box-image-container group">
                            <img 
                              src={`data:image/png;base64,${box.imageData}`}
                              alt={`${box.sportId} preview`}
                              className="box-image"
                            />
                            <div className="event-details-popup">
                              <EventDetailsPopup box={{
                                sportId: box.sportId,
                                sportData: {
                                  ...box.sportData,
                                  status: box.sportData?.status || { long: 'Unknown', short: 'UNK' },
                                  formattedStatus: box.sportData?.formattedStatus || ''
                                }
                              }} />                       
                            </div>
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

                          {isConnected ? (
                            <BettingSection box={box} />
                          ) : (
                            <div className="connect-notice p-4 text-center bg-gray-50 rounded-lg">
                              Connect wallet to place bets
                            </div>
                          )}
                          
                          {box.initialEvents && box.initialEvents.length > 0 && (
                            <div className="predictions-section bg-gray-50 rounded-lg p-4 my-4">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-lg">🔮 Predictions</span>
                              </div>
                              <div className="space-y-3">
                                {box.initialEvents.slice(0, 4).map((event, index) => (
                                  <div 
                                    key={index}
                                    className="bg-white rounded-lg p-3 border border-gray-100 hover:shadow-md transition-shadow"
                                  >
                                    {/* Who section */}
                                    <div className="flex items-center gap-2 mb-2 text-blue-600 font-medium">
                                      <span className="text-sm">🧞‍♂️</span>
                                      <span className="text-sm truncate" title={event.who}>
                                        {event.who}
                                      </span>
                                    </div>
                                    
                                    {/* Prediction content */}
                                    <div className="flex items-start gap-2 pl-4">
                                      <span className="text-sm text-gray-800 font-medium flex-1">
                                        {event.prediction}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className={`prediction-bar ${isUpdated ? 'progress-updated' : ''}`}>
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
                                box.isCancelled 
                                  ? 'cancelled'
                                  : box.isSettled || !box.timeRemaining || box.timeRemaining <= 0
                                    ? 'settled' 
                                    : 'active'
                              }`}>
                                {box.isCancelled 
                                  ? '⚠️ Cancelled'
                                  : box.isSettled || !box.timeRemaining || box.timeRemaining <= 0
                                    ? '🔴 Closed' 
                                    : '🟢 Open'
                                }
                              </span>
                              <span className="status-badge">
                                {box.isSettled ? '🤖 ✅' : box.isCancelled ? '🤖 ❌' : '🤖 ⏳'}
                              </span>
                              <span className="status-badge">
                                {box.isSettled ? '⚡ ✅' : box.isCancelled ? '⚡ ❌' : '⚡ ⏳'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </>
        </NavigationTabs>
        )}

        {/* Transaction Components */}
        {isConnected && !schemaError && (transactionData || signMessageData) && (
          <>
            {operationType === "transaction" && transactionData && uid && (
              <>
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

        <DisqusChatPanel 
          shortname="whaleinthebox"
          url="https://whaleinthebox.github.io/telegram-connect/dist/"
          identifier="Ocean"
          title="Whales Chat"
        />
    </>
  );
}

