import { useEffect } from 'react';
import { 
  type BaseError, 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { parseAbi, formatEther } from 'viem';

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
  // Ajoutez d'autres chaînes selon vos besoins
};

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WriteContract(data: WriteContractProps) {
  const { sendEvent } = data;
  const { writeContractAsync, isPending, data: hash, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  async function submit() {
    try {
      await writeContractAsync({
        address: data.address,
        abi: parseAbi(data.abi),
        functionName: data.functionName,
        args: data.args,
        value: data.value ? BigInt(data.value) : undefined,
      });
    } catch (err) {
      console.error('Contract write error:', err);
    }
  }

  useEffect(() => {
    if (isConfirmed) return sendEvent({ confirmed: true });
    if (hash) return sendEvent({ hash });
    if (error) return sendEvent({ error });
  }, [hash, error, isConfirmed, sendEvent]);

  const chainName = CHAIN_NAMES[data.chainId] || `Chain ID: ${data.chainId}`;
  const ethValue = data.value ? formatEther(BigInt(data.value)) : '0';

  return (
    <>
      <div className="container">
        <div className="stack">
          <div className="text">Network: {chainName}</div>
          <div className="text">
            Contract: <a 
              href={`https://basescan.org/address/${data.address}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', textDecoration: 'none' }}
            >
              {formatAddress(data.address)}
            </a>
          </div>
          <div className="text">Function: {data.functionName}</div>
          {data.args && data.args.length > 0 && (
            <div className="text">Arguments: {data.args.join(', ')}</div>
          )}
          {data.value && (
            <div className="text" style={{ color: '#3b82f6' }}>
              Value: {ethValue} ETH
            </div>
          )}
          <div className="buttonContainer">
            <button
              className="transactionButton"
              disabled={isPending || isConfirming}
              onClick={submit}
            >
              {isPending || isConfirming ? 'Processing...' : 'Sign Transaction'}
            </button>
          </div>
        </div>
      </div>

      {(hash || isConfirming || isConfirmed || error) && (
        <div className="container transactionStatus">
          {hash && (
            <div>
              <span>Transaction Hash: </span>
              <a 
                href={`https://basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3b82f6', textDecoration: 'none' }}
              >
                {formatAddress(hash)}
              </a>
            </div>
          )}
          {isConfirming && <div>Waiting for confirmation...</div>}
          {isConfirmed && <div>Transaction confirmed</div>}
          {error && (
            <div className="error">
              Error: {(error as BaseError).shortMessage || error.message}
            </div>
          )}
        </div>
      )}
    </>
  );
}