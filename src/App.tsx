import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WriteContract, WriteContractData } from './components/WriteContract';
import { SignMessage, SignMessageProps } from './components/SignMessage';
import { Account } from './components/Account';
import { Connect } from './components/Connect';
import ReactJson from 'react-json-view';
import { getSchemaError, sendEvent } from './utils';
import { formatEther } from 'viem';

// Types definitions
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
  // States
  const { isConnected } = useAccount();
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

  // Functions
  const calculateStats = (boxes: Box[]): Stats => {
    try {
      const activeBoxes = boxes.filter(box => !box.isSettled);
      const uniquePlayers = new Set<string>();
      let ethVolume = BigInt(0);
      let krillVolume = BigInt(0);
      let otherVolume = BigInt(0);

      boxes.forEach(box => {
        box.bets.forEach(bet => uniquePlayers.add(bet.participant));
        
        const amount = BigInt(box.totalAmount || '0');
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

  const formatTimeFromNow = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((date.getTime() - now.getTime()) / 1000);
    
    if (diff < 0) return 'Ended';
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const formatAddress = (address: string): string => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const onCallbackError = (error: any): void => {
    setCallbackError(error);
  };

  // Effects
  useEffect(() => {
    fetchBoxes();
    const interval = setInterval(fetchBoxes, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    const source = queryParameters.get("source") as string;
    setBotName(queryParameters.get("botName") as string);
    setUid(queryParameters.get("uid") as string);
    setCallbackEndpoint(queryParameters.get("callback") as string);

    const actionType = queryParameters.get("type") === "signature" ? "signature" : "transaction";
    setOperationType(actionType);

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

  // Render
  return (
    <>
      {isConnected && !schemaError && <Account botName={botName} />}
      {!isConnected && !schemaError && <Connect />}

      {/* Main Content */}
      {isConnected && !transactionData && !signMessageData && (
        <>
          {/* Stats Panel */}
          <div className="stats-container">
            <h2 className="stats-title">Platform Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">🐳 Players</span>
                <span className="stat-value">{stats.totalPlayers}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">📦 Active Boxes</span>
                <span className="stat-value">{stats.activeBoxes}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">ETH Volume</span>
                <span className="stat-value">{Number(stats.ethVolume).toFixed(2)} ETH</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">KRILL Volume</span>
                <span className="stat-value">{Number(stats.krillVolume).toFixed(2)} KRILL</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Other Tokens</span>
                <span className="stat-value">${Number(stats.otherTokensVolume).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Boxes Grid */}
          <div className="boxes-container">
            {isLoading ? (
              <div className="loading">Loading boxes...</div>
            ) : (
              <div className="boxes-grid">
                {boxes.map((box: Box) => (
                  <div 
                    key={box.address} 
                    className={`box-card ${lastUpdate[box.address] > box.lastUpdated ? 'box-updated' : ''}`}
                  >
                    <div className="box-header">
                      <span className="box-sport">{box.sportId}</span>
                      <span className="box-time">
                        {box.sportData?.scheduled && formatTimeFromNow(box.sportData.scheduled)}
                      </span>
                    </div>
                    
                    <div className="box-teams">
                      {box.sportData?.home_team} vs {box.sportData?.away_team}
                    </div>
                    
                    <div className="box-tournament">
                      {box.sportData?.tournament}
                    </div>
                    
                    <div className="box-info">
                      <span className="box-address">{formatAddress(box.address)}</span>
                      <span className="box-amount">
                        {formatEther(BigInt(box.totalAmount || '0'))} {box.tokenData.symbol || 'ETH'}
                      </span>
                    </div>
                    
                    <div className="box-footer">
                      <span className="box-bets">🐳 {box.bets.length}</span>
                      <span className={`box-status ${
                        box.sportData?.status === 'live' ? 'live' :
                        box.isSettled ? 'settled' : 'active'
                      }`}>
                        {box.sportData?.status || (box.isSettled ? 'Settled' : 'Active')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                {...signMessageData}
                uid={uid}
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