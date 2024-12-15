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

const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#bb0000', '#ffffff', '#00bb00', '#0000bb', '#ffaa00', '#00aaff'],
  });
};

const TransactionStatus = ({ 
  hash, 
  isConfirming, 
  isConfirmed, 
  error,
  userRejected 
}: { 
  hash: `0x${string}` | undefined;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
  userRejected: boolean;
}) => (
  <div className="mt-4 rounded-xl bg-white p-4 shadow-lg">
    {isConfirming && (
      <div className="flex items-center justify-center gap-3 text-blue-600">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"/>
        <span className="font-medium">Confirming transaction...</span>
      </div>
    )}
    
    {isConfirmed && (
      <div className="flex items-center justify-center gap-2 text-emerald-600">
        <span className="text-xl">✅</span>
        <span className="font-medium">Transaction confirmed!</span>
      </div>
    )}
    
    {error && !userRejected && (
      <div className="text-center text-red-600">
        <span className="text-xl">❌</span>
        <p className="font-medium">
          {(error as BaseError).shortMessage || 'Transaction failed'}
        </p>
      </div>
    )}
    
    {userRejected && (
      <div className="text-center text-orange-600">
        <span className="text-xl">⚠️</span>
        <p className="font-medium">Transaction rejected</p>
      </div>
    )}
    
    {hash && (
      <a 
        href={`https://basescan.org/tx/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block text-center text-sm text-blue-500 hover:text-blue-600 transition-colors"
      >
        View on Block Explorer →
      </a>
    )}
  </div>
);

export function WriteContract(data: WriteContractProps) {
  const { sendEvent } = data;
  const [userRejected, setUserRejected] = useState(false);

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

  const error = writeError || confirmError || (isSimulateError ? simulateError : null);
  const isProcessing = isPending || isConfirming;
  
  const chainName = CHAIN_NAMES[data.chainId] || `Chain ID: ${data.chainId}`;
  const displayValue = data.value ? formatEther(BigInt(data.value)) : '0';

  useEffect(() => {
    if (isConfirmed) {
      triggerConfetti();
      sendEvent({ confirmed: true });
    } else if (hash) {
      sendEvent({ hash });
    } else if (error && !userRejected) {
      sendEvent({ error });
    }
  }, [hash, error, isConfirmed, sendEvent, userRejected]);
  
  const submit = async () => {
    setUserRejected(false);
    try {
      if (isSimulateError) {
        console.error('Simulation failed:', simulateError);
        return;
      }

      const transactionValue = data.value ? BigInt(data.value) : undefined;

      await writeContractAsync({
        address: data.address,
        abi: parseAbi(data.abi),
        functionName: data.functionName,
        args: data.args,
        value: transactionValue,
      });
    } catch (err: any) {
      console.error('Contract write error:', err);
      if (typeof err === 'object' && err?.message?.includes('user rejected')) {
        setUserRejected(true);
      }
    }
  };

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (isSimulateError) return 'Transaction Will Fail';
    return data.functionName === 'createBet' ? 'Confirm Bet' : 'Sign Transaction';
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {data.functionName === 'createBet' ? 'Confirm Your Bet' : 'Confirm Transaction'}
          </h2>
          
          {data.value && Number(data.value) > 0 && (
            <div className="text-3xl font-bold text-blue-600">
              {displayValue} ETH
            </div>
          )}
          
          <div className="mt-2 text-sm text-gray-600">
            on {chainName}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={isProcessing || isSimulateError}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-white text-lg
            transition-all transform active:scale-98
            ${isProcessing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : isSimulateError
                ? 'bg-red-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          {getButtonText()}
        </button>
      </div>

      {(hash || isConfirming || isConfirmed || error) && (
        <TransactionStatus
          hash={hash}
          isConfirming={isConfirming}
          isConfirmed={isConfirmed}
          error={error as Error}
          userRejected={userRejected}
        />
      )}
    </div>
  );
}