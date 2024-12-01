import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WriteContract, WriteContractData } from './components/WriteContract';
import { SignMessage, SignMessageProps } from './components/SignMessage';
import { Account } from './components/Account';
import { Connect } from './components/Connect';
import ReactJson from 'react-json-view';
import { getSchemaError, sendEvent } from './utils';

interface Box {
  address: string;
  chainId: number;
  sportId: string;
  sportData: {
    home_team?: string;
    away_team?: string;
    tournament?: string;
    scheduled?: string;
    status?: string;
  };
  bets: any[];
  isSettled: boolean;
  totalAmount: string;
}

export default function App() {
  const { isConnected } = useAccount();
  const [transactionData, setTransactionData] = useState<WriteContractData>();
  const [signMessageData, setSignMessageData] = useState<SignMessageProps>();
  const [callbackEndpoint, setCallbackEndpoint] = useState('');
  const [schemaError, setSchemaError] = useState<any>(false);
  const [callbackError, setCallbackError] = useState<any>();
  const [uid, setUid] = useState<string | undefined>();
  const [operationType, setOperationType] = useState<string>("");
  const [botName, setBotName] = useState<string>("");
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch boxes from the API
    const fetchBoxes = async () => {
      try {
        const response = await fetch('https://witbbot-638008614172.us-central1.run.app/boxes');
        const data = await response.json();
        if (data.success && Array.isArray(data.boxes)) {
          setBoxes(data.boxes);
        }
      } catch (error) {
        console.error('Error fetching boxes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoxes();
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

  const onCallbackError = (error: any) => {
    setCallbackError(error);
  };

  // Format relative time from now
  const formatTimeFromNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((date.getTime() - now.getTime()) / 1000);
    
    if (diff < 0) return 'Ended';
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  // Function to format an address
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <>
      {isConnected && !schemaError && <Account botName={botName} />}
      {!isConnected && !schemaError && <Connect />}

      {/* Boxes Display */}
      {isConnected && !transactionData && !signMessageData && (
        <div className="container">
          <h2 className="text-xl font-bold mb-4">Active Boxes</h2>
          {isLoading ? (
            <div className="text-center p-4">Loading boxes...</div>
          ) : (
            <div className="space-y-4">
              {boxes.map((box, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">
                      {box.sportId} - {box.sportData?.tournament}
                    </span>
                    <span className="text-sm text-blue-500">
                      {box.sportData?.scheduled && formatTimeFromNow(box.sportData.scheduled)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {box.sportData?.home_team} vs {box.sportData?.away_team}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {formatAddress(box.address)}
                    </span>
                    <span className="font-medium">
                      {box.totalAmount} ETH • {box.bets.length} bets
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      box.sportData?.status === 'live' ? 'bg-green-100 text-green-800' :
                      box.isSettled ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {box.sportData?.status || (box.isSettled ? 'Settled' : 'Active')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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