// WriteContract.tsx
import { useEffect } from 'react';
import { 
  BaseError, 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { parseAbi } from 'viem';

export interface WriteContractData {
  chainId: number;
  address: `0x${string}`;
  abi: string[];
  functionName: string;
  args: any[];
  value?: string;
}

type WriteContractProps = WriteContractData & {
  uid: string;
  sendEvent: (event: any) => void;
}

export function WriteContract(data: WriteContractProps) {
  const { sendEvent } = data;
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  async function submit() {
    writeContract({
      address: data.address,
      abi: parseAbi(data.abi),
      functionName: data.functionName,
      args: data.args,
      value: data.value ? BigInt(data.value) : undefined,
    });
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
            <div className="text-sm text-gray-600 mb-4">
              Transaction Value: {BigInt(data.value).toString()} wei
            </div>
          )}
          <div className="buttonContainer">
            <button
              className="transactionButton"
              disabled={isPending || isConfirming}
              onClick={submit}
            >
              {isPending || isConfirming ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isPending ? 'Confirming...' : 'Processing...'}
                </span>
              ) : (
                'Sign Transaction'
              )}
            </button>
          </div>
        </div>
      </div>
      {(hash || isConfirming || isConfirmed || error) && (
        <div className="container">
          <div className="space-y-4">
            {hash && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">Transaction Hash:</span>
                <pre className="mt-1 bg-gray-50 p-3 rounded-lg overflow-auto text-xs">
                  {hash}
                </pre>
              </div>
            )}
            {isConfirming && (
              <div className="flex items-center text-blue-600">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Waiting for confirmation...
              </div>
            )}
            {isConfirmed && (
              <div className="flex items-center text-green-600">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Transaction confirmed
              </div>
            )}
            {error && (
              <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm">
                  Error: {(error as BaseError).shortMessage || error.message}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}