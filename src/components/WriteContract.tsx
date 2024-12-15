import { useEffect, useState } from 'react';
import { 
  type BaseError, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useSimulateContract
} from 'wagmi';
import { parseAbi, formatEther } from 'viem';
import confetti from 'canvas-confetti';

export interface WriteContractData {
  chainId: number;
  address: `0x${string}`;
  abi: string[];
  functionName: string;
  args: any[];
  value?: string;
}

interface WriteContractProps extends WriteContractData {
  uid: string;
  sendEvent: (event: any) => void;
}

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  5: 'Goerli Testnet',
  137: 'Polygon',
  8453: 'Base',
};

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const transactionGifs = [
  'https://media.giphy.com/media/H3cBaC5OnaJ79UjL9h/giphy.gif',
  'https://media.giphy.com/media/orVWNtMXSr9eDEUwhH/giphy.gif',
  'https://media.giphy.com/media/LrN9NbJNp9SWQ/giphy.gif',
  'https://media.giphy.com/media/2wSe48eAUC15p38UqO/giphy.gif',
  'https://media.giphy.com/media/KgX7on3DWfGSKGK8eI/giphy.gif',
];

export function WriteContract(data: WriteContractProps) {
  const { sendEvent } = data;
  const [userRejected, setUserRejected] = useState(false);
  const [selectedGif, setSelectedGif] = useState('');
  
  // Simuler la transaction d'abord
  const { isError: isSimulateError, error: simulateError } = useSimulateContract({
    address: data.address,
    abi: parseAbi(data.abi),
    functionName: data.functionName,
    args: data.args,
    value: data.value ? BigInt(data.value) : undefined,
  });

  const { writeContractAsync, isPending, data: hash, error: writeError } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError 
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Gérer tous les types d'erreurs
  const error = writeError || confirmError || (isSimulateError ? simulateError : null);

  const selectRandomGif = () => {
    const randomIndex = Math.floor(Math.random() * transactionGifs.length);
    setSelectedGif(transactionGifs[randomIndex]);
  };

  async function submit() {
    setUserRejected(false);
    try {
      if (isSimulateError) {
        console.error('Simulation failed:', simulateError);
        return;
      }

      let transactionValue;
      if (data.value) {
        try {
          transactionValue = BigInt(data.value);
        } catch (err) {
          console.error('Invalid value format:', err);
          return;
        }
      }

      await writeContractAsync({
        address: data.address,
        abi: parseAbi(data.abi),
        functionName: data.functionName,
        args: data.args,
        value: transactionValue,
      });

      selectRandomGif(); // Sélectionne un GIF aléatoire après une transaction réussie

    } catch (err: any) {  // Typage explicite de l'erreur
      console.error('Contract write error:', err);
      // Vérification sécurisée du message d'erreur
      if (typeof err === 'object' && err !== null && 'message' in err) {
        if (err.message.includes('user rejected transaction')) {
          setUserRejected(true);
        }
      }
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      sendEvent({ confirmed: true });
      
      // Déclencher les confettis après une transaction réussie
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#bb0000', '#ffffff', '#00bb00', '#0000bb', '#ffaa00', '#00aaff'],
      });
      
    } else if (hash) {
      sendEvent({ hash });
    } else if (error && !userRejected) {
      sendEvent({ error });
    }
  }, [hash, error, isConfirmed, sendEvent, userRejected]);

  const chainName = CHAIN_NAMES[data.chainId] || `Chain ID: ${data.chainId}`;
  const isProcessing = isPending || isConfirming;

  const displayValue = data.value ? 
    formatEther(BigInt(data.value)) : 
    '0 ETH';

  return (
    <>
      <div className="container">
        <div className="header">
          <img id="logo"  src="public/images/logo.png" alt="Whale in the Box" className="header-logo" />
        </div>
        
        <div className="transaction-info">
          <div className="detail-row">
            <span className="detail-label">Network:</span>
            <span className="detail-value">{chainName}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Contract:</span>
            <a 
              href={`https://basescan.org/address/${data.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-value contract-address"
            >
              {formatAddress(data.address)}
            </a>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Function:</span>
            <span className="detail-value">{data.functionName}</span>
          </div>
                    
          {data.value && Number(data.value) > 0 && (
            <div className="detail-row">
              <span className="detail-label">Bet Amount:</span>
              <span className="detail-value amount">
                {displayValue} ETH
              </span>
            </div>
          )}
        </div>

        <div className="buttonContainer">
          <button
            className={`transactionButton ${isSimulateError ? 'error' : ''}`}
            disabled={isProcessing || isSimulateError}
            onClick={submit}
          >
            {isProcessing ? 'Processing...' : 
             isSimulateError ? 'Transaction Will Fail' : 
             'Sign Transaction'}
          </button>
        </div>
      </div>

      {(hash || isConfirming || isConfirmed || error) && (
        <div className="container transaction-status">
          {hash && (
            <div className="status-row">
              <span className="status-label">Transaction:</span>
              <a 
                href={`https://basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hash-link"
              >
                {formatAddress(hash)}
              </a>
            </div>
          )}
          {isConfirming && (
            <div className="status-message pending">
              Waiting for confirmation...
            </div>
          )}
          {isConfirmed && selectedGif && (
            <div className="status-message success">
              <img src={selectedGif} alt="Transaction GIF" />
              <div>Transaction confirmed! ✅</div>
            </div>
          )}
          {error && !userRejected && (
            <div className="status-message error">
              Error: {(error as BaseError).shortMessage || (error as Error).message || 'Transaction failed'}
            </div>
          )}
          {userRejected && (
            <div className="status-message warning">
              Transaction rejected by user
            </div>
          )}
        </div>
      )}
    </>
  );
}