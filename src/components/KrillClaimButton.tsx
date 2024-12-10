import { useState } from 'react';
import { ethers } from 'ethers';
import { KRILL_ABI } from '../constants/contracts';
import { useAccount, useWalletClient } from 'wagmi';

const KRILL_CONTRACT = "0x33E5b643C05a3B00F71a066FefA4F59eF6BE27fc";

const KrillClaimButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const handleClaim = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isConnected || !walletClient) {
      alert('Please connect your wallet first!');
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    try {
      // Créer un provider ethers à partir du walletClient wagmi
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(KRILL_CONTRACT, KRILL_ABI, signer);

      // Petit délai pour la stabilité
      await new Promise(resolve => setTimeout(resolve, 500));

      // Appel du contrat avec gestion du gas
      const tx = await contract.airdrop({
        gasLimit: 100000
      });
      
      setTxHash(tx.hash);
      
      // Attendre la confirmation
      await tx.wait();
      
      alert('🎉 Successfully claimed KRILL!');
      
    } catch (error: any) {
      console.error('Full claim error:', error);

      // Gestion spécifique des erreurs
      if (error.message?.includes('AirdropIntervalNotReached')) {
        alert('Please wait before claiming again');
      } else if (error.message?.includes('user rejected') || error.message?.includes('User denied')) {
        alert('Transaction was rejected');
      } else if (error.message?.includes('insufficient funds')) {
        alert('Insufficient funds for gas');
      } else if (error.message?.includes('gas')) {
        alert('Gas estimation failed. Please try again');
      } else {
        console.error('Claim error:', error);
        alert('Failed to claim KRILL: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClaim}
        disabled={isProcessing}
        className={`
          p-2 bg-blue-50 rounded-lg transition-all duration-200
          ${!isProcessing && 'hover:bg-blue-100 hover:shadow-sm'}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title="Claim KRILL"
      >
        <div className="relative flex items-center justify-center">
          {isProcessing ? (
            <span className="text-xl animate-spin">⏳</span>
          ) : (
            <span className="text-xl transform inline-block hover:scale-110 transition-transform">
              🎁
            </span>
          )}
        </div>
      </button>
      
      {/* Transaction Link */}
      {txHash && (
        <a
          href={`https://basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-full right-0 mt-1 text-xs text-blue-500 hover:text-blue-600 whitespace-nowrap"
        >
          View transaction →
        </a>
      )}
    </div>
  );
};

export default KrillClaimButton;