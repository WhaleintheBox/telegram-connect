// SignMessage.tsx
import { useState, useEffect } from 'react';
import { useSignTypedData } from 'wagmi';

interface Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: `0x${string}`;
}

export interface SignMessageProps {
  domain: Domain;
  primaryType: string;
  types: Record<string, any>;
  message: Record<string, any>;
  uid: string;
  sendEvent: (event: any) => void;
}

export function SignMessage(props: SignMessageProps) {
  const { domain, primaryType, types, message, sendEvent } = props;
  const { signTypedData } = useSignTypedData();
  const [error, setError] = useState<any>();
  const [hash, setHash] = useState<`0x${string}`>();
  const [isPending, setIsPending] = useState(false);

  const signMessage = () => {
    setIsPending(true);
    signTypedData(
      {
        domain,
        primaryType,
        types,
        message,
      },
      {
        onError: (error: Error) => {
          setError(error);
          setIsPending(false);
        },
        onSuccess: (hash: `0x${string}`) => {
          setHash(hash);
          setIsPending(false);
        },
      }
    );
  };

  useEffect(() => {
    if (hash) return sendEvent({ hash });
    if (error) return sendEvent({ error });
  }, [hash, error, sendEvent]);

  return (
    <>
      <div className="container">
        <div className="stack">
          <div className="text-gray-700 bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium mb-2">Message to Sign:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(message, null, 2)}
            </pre>
          </div>
          <div className="buttonContainer">
            <button
              onClick={signMessage}
              disabled={isPending}
              className="transactionButton"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
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
      {(hash || error) && (
        <div className="container">
          {hash && (
            <div className="text-sm mb-2 text-gray-700">
              <span className="font-medium">Signature:</span>
              <pre className="mt-1 bg-gray-50 p-3 rounded-lg overflow-auto text-xs">
                {hash}
              </pre>
            </div>
          )}
          {error && (
            <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm">
                Error: {error.message}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}