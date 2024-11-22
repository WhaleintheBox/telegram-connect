import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';  // Retiré useNetwork car non utilisé
import { WriteContract, WriteContractData } from './components/WriteContract';
import { SignMessage, SignMessageProps } from './components/SignMessage';
import { Account } from './components/Account';
import { Connect } from './components/Connect';
import ReactJson from 'react-json-view';
import { getSchemaError, sendEvent } from './utils';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const queryParameters = new URLSearchParams(window.location.search);
        const source = queryParameters.get("source");
        
        if (!source) {
          throw new Error("Source parameter is missing");
        }

        setBotName(queryParameters.get("botName") || "");
        setUid(queryParameters.get("uid") || "");
        setCallbackEndpoint(queryParameters.get("callback") || "");

        const actionType = queryParameters.get("type") === "signature" ? "signature" : "transaction";
        setOperationType(actionType);

        console.log("Fetching from source:", source);
        const response = await fetch(source);
        const data = await response.json();
        console.log("Received data:", data);

        const error = getSchemaError(actionType, data);
        if (error) {
          console.error("Schema error:", error);
          setSchemaError(error);
        } else {
          if (actionType === "signature") {
            setSignMessageData(data);
          } else {
            setTransactionData(data);
          }
        }
      } catch (error) {
        console.error("Error in data fetch:", error);
        setSchemaError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onCallbackError = (error: any) => {
    console.error("Callback error:", error);
    setCallbackError(error);
  };

  // Styles adaptés pour mobile
  const containerStyle = {
    padding: '15px',
    maxWidth: '100%',
    margin: '0 auto'
  };

  const loadingStyle = {
    textAlign: 'center' as const,
    padding: '20px',
    color: '#666'
  };

  const errorStyle = {
    padding: '15px',
    margin: '10px 0',
    borderRadius: '8px',
    backgroundColor: '#fee',
    color: '#c00'
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        Loading transaction data...
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {isConnected && !schemaError && <Account botName={botName}/>}
      {!isConnected && !schemaError && <Connect />}
      {isConnected && !schemaError && (transactionData || signMessageData) && 
        <>
          {(operationType === "transaction") && transactionData && uid && (
            <>
              <div className="container">
                <ReactJson 
                  src={transactionData} 
                  collapsed={true} 
                  theme="monokai"
                  style={{ fontSize: '14px', marginBottom: '15px' }}
                />
              </div>
              <WriteContract
                uid={uid}
                chainId={transactionData.chainId}
                address={transactionData.address}
                abi={transactionData.abi}
                functionName={transactionData.functionName}
                args={transactionData.args}
                sendEvent={(data: any) => {
                  console.log("Sending event:", data);
                  sendEvent(uid, callbackEndpoint, onCallbackError, {
                    ...data,
                    transaction: true
                  });
                }}
              />
            </>
          )}
          {(operationType === "signature") && signMessageData && uid && (
            <>
              <div className="container">
                <ReactJson 
                  src={signMessageData} 
                  collapsed={true} 
                  theme="monokai"
                  style={{ fontSize: '14px', marginBottom: '15px' }}
                />
              </div>
              <SignMessage
                uid={uid}
                domain={signMessageData.domain}
                primaryType={signMessageData.primaryType}
                types={signMessageData.types}
                message={signMessageData.message}
                sendEvent={(data: any) => {
                  console.log("Sending signature event:", data);
                  sendEvent(uid, callbackEndpoint, onCallbackError, {
                    ...data,
                    signature: true
                  });
                }}
              />
            </>
          )}
        </>
      }
      {schemaError && (
        <div style={errorStyle}>
          <div>Invalid transaction data</div>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(schemaError, null, 2)}
          </pre>
        </div>
      )}
      {callbackError && (
        <div style={errorStyle}>
          <div>Error during callback to {callbackEndpoint}</div>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(callbackError, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
