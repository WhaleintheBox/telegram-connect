import { useAccount } from 'wagmi';
import { useState } from 'react';
import { ethers } from 'ethers';

const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
};

interface TransactionResult {
  hash: string;
  wait: () => Promise<any>;
}

export const useMobileTransaction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeMobileTransaction = async (
    transactionConfig: {
      to: string;
      data: string;
      value?: string;
      gasLimit?: number;
    }
  ): Promise<TransactionResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error('No wallet detected');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Ajuster le gas limit pour mobile
      const gasLimit = isMobileDevice() ? 400000 : 300000;

      const tx = await signer.sendTransaction({
        to: transactionConfig.to,
        data: transactionConfig.data,
        value: transactionConfig.value || '0',
        gasLimit: transactionConfig.gasLimit || gasLimit
      });

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };

    } catch (err: any) {
      console.error('Transaction error:', err);
      let errorMessage = 'Transaction failed';
      
      if (err.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds';
      } else if (err.message.includes('gas')) {
        errorMessage = 'Gas estimation failed';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeTokenApproval = async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    tokenAbi: any
  ): Promise<TransactionResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error('No wallet detected');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);

      const gasLimit = isMobileDevice() ? 150000 : 100000;

      const tx = await tokenContract.approve(spenderAddress, amount, {
        gasLimit
      });

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };

    } catch (err: any) {
      console.error('Approval error:', err);
      const errorMessage = err.message || 'Approval failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Nouvelle fonction pour gérer les paris ERC20 en une seule fonction
  const executeERC20Bet = async (
    tokenAddress: string,
    boxAddress: string,
    prediction: string,
    amount: string,
    tokenAbi: any,
    boxAbi: any,
    needsApproval: boolean,
    onStatus: (status: 'approving' | 'betting' | 'complete') => void,
    onTxHash: (hash: string) => void
  ) => {
    if (needsApproval) {
      onStatus('approving');
      const approvalTx = await executeTokenApproval(
        tokenAddress,
        boxAddress,
        amount,
        tokenAbi
      );
      onTxHash(approvalTx.hash);
      await approvalTx.wait();
    }

    onStatus('betting');
    const betTx = await executeMobileTransaction({
      to: boxAddress,
      data: new ethers.Interface(boxAbi).encodeFunctionData('createBetWithAmount', [
        prediction,
        amount
      ]),
      gasLimit: 400000
    });

    onTxHash(betTx.hash);
    await betTx.wait();
    onStatus('complete');
  };

  return {
    executeMobileTransaction,
    executeTokenApproval,
    executeERC20Bet,
    isProcessing,
    error,
    clearError: () => setError(null)
  };
};

// MobileTransactionButton reste inchangé
export const MobileTransactionButton = ({ 
  onTransaction,
  disabled,
  children
}: { 
  onTransaction: () => Promise<void>;
  disabled?: boolean;
  children: React.ReactNode;
}) => {
  const { isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!isConnected || isProcessing || disabled) return;

    setIsProcessing(true);
    setError(null);

    try {
      await onTransaction();
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="transaction-button-container">
      <button
        onClick={handleClick}
        disabled={!isConnected || isProcessing || disabled}
        className={`transaction-button ${isProcessing ? 'processing' : ''} ${
          error ? 'error' : ''
        }`}
      >
        {isProcessing ? 'Processing...' : children}
      </button>
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-dismiss">
            ×
          </button>
        </div>
      )}
    </div>
  );
};