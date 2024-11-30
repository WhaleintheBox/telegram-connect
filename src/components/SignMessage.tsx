import { useState, useEffect } from 'react';
import { useSignTypedData, type BaseError } from 'wagmi';

interface Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: `0x${string}`;
}

// Cette interface doit être exportée pour être utilisée dans App.tsx
export interface SignMessageProps {
  uid: string;
  domain: Domain;
  primaryType: string;
  types: Record<string, any>;
  message: Record<string, any>;
  sendEvent: (event: any) => void;
}

export function SignMessage({ 
  domain, 
  primaryType, 
  types, 
  message, 
  sendEvent 
}: SignMessageProps) {
  const { signTypedDataAsync } = useSignTypedData();
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [isPending, setIsPending] = useState(false);

  const signMessage = async () => {
    try {
      setIsPending(true);
      const signature = await signTypedDataAsync({
        domain,
        primaryType,
        types,
        message,
      });
      setHash(signature);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (hash) return sendEvent({ hash });
    if (error) return sendEvent({ error });
  }, [hash, error, sendEvent]);

  return (
    <>
      <div className="container">
        <div className="stack">
          <div className="messagePreview">
            <h3>Message to Sign:</h3>
            <pre>{JSON.stringify(message, null, 2)}</pre>
          </div>
          <div className="buttonContainer">
            <button
              onClick={signMessage}
              disabled={isPending}
              className="transactionButton"
            >
              {isPending ? 'Signing...' : 'Sign Message'}
            </button>
          </div>
        </div>
      </div>
      {(hash || error) && (
        <div className="container">
          {hash && (
            <div className="transactionStatus">
              <span>Signature:</span>
              <pre>{hash}</pre>
            </div>
          )}
          {error && (
            <div className="transactionStatus error">
              Error: {(error as BaseError).shortMessage || error.message}
            </div>
          )}
        </div>
      )}
    </>
  );
}