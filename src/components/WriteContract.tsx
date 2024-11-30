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

  return (
    <>
      <div className="container transaction-info">
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
        {data.args && data.args.length > 0 && (
          <div className="detail-row">
            <span className="detail-label">Arguments:</span>
            <span className="detail-value">{data.args.join(', ')}</span>
          </div>
        )}
        {data.value && Number(data.value) > 0 && (
          <div className="detail-row">
            <span className="detail-label">Bet Amount:</span>
            <span className="detail-value amount">
              {formatEther(BigInt(data.value))} ETH
            </span>
          </div>
        )}
        <div className="button-row">
          <button
            className="transactionButton"
            disabled={isPending || isConfirming}
            onClick={submit}
          >
            {isPending || isConfirming ? 'Processing...' : 'Sign Transaction'}
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
          {isConfirmed && (
            <div className="status-message success">
              Transaction confirmed
            </div>
          )}
          {error && (
            <div className="status-message error">
              Error: {(error as BaseError).shortMessage || error.message}
            </div>
          )}
        </div>
      )}
    </>
  );
}