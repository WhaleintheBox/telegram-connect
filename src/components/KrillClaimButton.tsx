import { useState } from 'react';
import { ethers } from 'ethers';
import { KRILL_ABI } from '../constants/contracts';

const KRILL_CONTRACT = "0x33E5b643C05a3B00F71a066FefA4F59eF6BE27fc";

const KrillClaimButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const handleClaim = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(KRILL_CONTRACT, KRILL_ABI, signer);

      await new Promise(resolve => setTimeout(resolve, 500));

      const tx = await contract.airdrop({
        gasLimit: 100000
      });
      setTxHash(tx.hash);
      await tx.wait();
      
      alert('🎉 Successfully claimed KRILL!');
    } catch (error: any) {
      console.error('Full claim error:', error);

      if (error.message?.includes('AirdropIntervalNotReached')) {
        alert('Please wait before claiming again');
      } else if (error.message?.includes('user rejected')) {
        alert('Transaction was rejected');
      } else {
        console.error('Claim error:', error);
        alert('Failed to claim KRILL: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClaim}
        disabled={isProcessing}
        className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 disabled:opacity-50"
        title="Claim KRILL"
      >
        <div className="relative flex items-center justify-center">
          <span className="text-xl transform inline-block hover:scale-110 transition-transform">
            {isProcessing ? '⏳' : '🎁'}
          </span>
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