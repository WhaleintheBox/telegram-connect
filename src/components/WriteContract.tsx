import { useEffect, useState } from 'react';
import { type BaseError, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId, useSwitchChain } from 'wagmi';
import { parseAbi } from 'viem';

export interface WriteContractData {
  chainId: number,
  address: `0x${string}`,
  abi: string[],
  functionName: string,
  args: any[]
}

type WriteContractProps = WriteContractData & {
  uid: string,
  sendEvent: (event: any) => void
}

export function WriteContract(data: WriteContractProps) {
  const { sendEvent } = data;
  const [error, setError] = useState<Error | null>(null);
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();

  const { data: hash, error: writeError, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      sendEvent({ confirmed: true });
    }
    if (hash) {
      sendEvent({ hash });
    }
    if (writeError) {
      setError(writeError);
      sendEvent({ error: writeError });
    }
  }, [hash, writeError, isConfirmed, sendEvent]);

  async function submit() {
    try {
      setError(null);

      // Vérifier et changer de réseau si nécessaire
      if (chainId !== data.chainId && switchChain) {
        await switchChain({ chainId: data.chainId });
        return; // Le changement de réseau va recharger le composant
      }

      // Parser l'ABI et envoyer la transaction
      const parsedAbi = parseAbi(data.abi);
      
      writeContract({
        address: data.address,
        abi: parsedAbi,
        functionName: data.functionName,
        args: data.args,
      });

    } catch (err) {
      console.error('Transaction error:', err);
      const error = err as Error;
      setError(error);
      sendEvent({ error: error.message });
    }
  }

  const StatusPanel = () => {
    return (
      <div className="container transactionStatus">
        {hash && <div>Transaction Hash: {hash}</div>}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
        {error && (
          <div>Error: {(error as BaseError).shortMessage || error.message}</div>
        )}
      </div>
    );
  }

  const buttonStyle = {
    width: '100%',
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '8px',
    backgroundColor: isPending ? '#cccccc' : '#007AFF',
    color: 'white',
    border: 'none',
    cursor: isPending ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    opacity: isPending ? 0.7 : 1,
  };

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (chainId !== data.chainId) return 'Switch to Base Network';
    if (isPending) return 'Confirming...';
    if (isConfirming) return 'Waiting for confirmation...';
    return 'Send Transaction';
  };

  return (
    <>
      <div className="container" style={{ padding: '15px' }}>
        <div className="stack">
          <div className="buttonContainer">
            <button 
              className="transactionButton"
              style={buttonStyle}
              disabled={isPending || !isConnected || (chainId !== data.chainId && !switchChain)} 
              onClick={submit}
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
      {(hash || isConfirming || isConfirmed || error) && <StatusPanel />}
    </>
  );
}
