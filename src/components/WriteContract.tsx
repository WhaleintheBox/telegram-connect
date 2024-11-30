import { useEffect } from 'react';
import { type BaseError, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi } from 'viem';

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

  return (
    <>
      <div className="container">
        <div className="stack">
          {data.value && (
            <div className="text">
              Transaction Value: {BigInt(data.value).toString()} wei
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
              <span>Transaction Hash:</span>
              <pre>{hash}</pre>
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