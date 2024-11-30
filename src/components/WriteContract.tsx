import { useEffect } from 'react';
import { type BaseError, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi } from 'viem';

export interface WriteContractData {
  chainId: number,
  address: `0x{string}`,
  abi: string[],
  functionName: string,
  args: any[],
  value?: string
}

type WriteContractProps = WriteContractData & {
  uid: string,
  sendEvent: (event: any)=>void
}

export function WriteContract(data: WriteContractProps) {
  const { sendEvent } = data;
  const { data: hash, error, isPending, writeContract } = useWriteContract()

  async function submit() {
    writeContract({
      address: data.address,
      abi: parseAbi(data.abi),
      functionName: data.functionName,
      args: data.args,
      value: data.value ? BigInt(data.value) : undefined
    })
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    if (isConfirmed) {
      return sendEvent({ confirmed: true })
    }
    if (hash) {
      return sendEvent({ hash })
    }
    if (error) {
      return sendEvent({ error })
    }
  }, [hash, error, isConfirmed])

  const StatusPanel = () => {
    return (
      <div className="container">
        <div className="space-y-4">
          {hash && (
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Transaction Hash:</span>
              <code className="text-xs sm:text-sm bg-gray-50 p-2 rounded-lg font-mono break-all">
                {hash}
              </code>
            </div>
          )}
          {isConfirming && (
            <div className="flex items-center text-blue-600">
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Waiting for confirmation...
            </div>
          )}
          {isConfirmed && (
            <div className="text-green-600 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Transaction confirmed
            </div>
          )}
          {error && (
            <div className="text-red-600 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                Error: {(error as BaseError).shortMessage || error.message}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container">
        <div className="space-y-4">
          {data.value && (
            <div className="text-sm text-gray-600">
              Transaction Value: {BigInt(data.value).toString()} wei
            </div>
          )}
          <div className="flex justify-center">
            <button 
              className={`
                w-full sm:w-auto min-w-[200px] px-6 py-3 rounded-lg font-medium
                ${isPending || isConfirming
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }
              `}
              disabled={isPending || isConfirming}
              onClick={submit}
            >
              <span className="flex items-center justify-center">
                {(isPending || isConfirming) && (
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {isPending || isConfirming ? 'Confirming...' : 'Sign Transaction'}
              </span>
            </button>
          </div>
        </div>
      </div>
      {(hash || isConfirming || isConfirmed || error) && <StatusPanel />}
    </>
  );
}