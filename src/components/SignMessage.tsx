import { useEffect, useState } from 'react'
import { useSignTypedData } from 'wagmi'

interface Domain {
  name: string,
  version: string,
  chainId: number,
  verifyingContract: `0x${string}`
}

export interface SignMessageProps {
  domain: Domain,
  primaryType: string,
  types: any,
  message: any,
  uid: string,
  sendEvent: (event: any)=>void
}

export function SignMessage(props: SignMessageProps) {
  const { domain, primaryType, types, message, sendEvent } = props;
  const { signTypedData } = useSignTypedData();
  const [error, setError] = useState<any>();
  const [hash, setHash] = useState<`0x${string}`>();
  const [isPending, setIsPending] = useState(false);

  const signMessage = () => {
    setIsPending(true);
    signTypedData({
        domain,
        primaryType,
        types,
        message
      },
      {
        onError: error => {
          setError(error);
          setIsPending(false);
        },
        onSuccess: hash => {
          setHash(hash);
          setIsPending(false);
        }
      }
    );
  }

  const StatusPanel = () => {
    return (
      <div className="container">
        <div className="space-y-4">
          {hash && (
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Signature Hash:</span>
              <code className="text-xs sm:text-sm bg-gray-50 p-3 rounded-lg font-mono break-all">
                {hash}
              </code>
            </div>
          )}
          {error && (
            <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm">
                Error: {error.shortMessage || error.message}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (hash) {
      return sendEvent({ hash })
    }
    if (error) {
      return sendEvent({ error })
    }
  }, [hash, error, sendEvent])

  return (
    <>
      <div className="container">
        <div className="space-y-4">
          {/* Message Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Message to Sign:</h3>
            <div className="text-xs sm:text-sm font-mono text-gray-600 break-all">
              {JSON.stringify(message, null, 2)}
            </div>
          </div>

          {/* Sign Button */}
          <div className="flex justify-center pt-2">
            <button 
              onClick={signMessage}
              disabled={isPending}
              className={`
                w-full sm:w-auto min-w-[200px] px-6 py-3 rounded-lg font-medium
                flex items-center justify-center
                ${isPending 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }
              `}
            >
              {isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing...
                </span>
              ) : (
                'Sign Message'
              )}
            </button>
          </div>
        </div>
      </div>
      {(hash || error) && <StatusPanel />}
    </>
  )
}