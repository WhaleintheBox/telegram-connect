import { useState, useEffect } from 'react';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: string) => Promise<void>;
  tokenSymbol: string;
  betType: 'hunt' | 'fish';
}

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'error' | 'success' | 'loading';
}

function MessageModal({ isOpen, onClose, title, message, type = 'info' }: MessageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60]">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          <div 
            className={`p-4 rounded-lg ${
              type === 'error' ? 'bg-red-50 text-red-800' :
              type === 'success' ? 'bg-green-50 text-green-800' :
              type === 'loading' ? 'bg-blue-50 text-blue-800' :
              'bg-gray-50 text-gray-800'
            }`}
          >
            {message}
          </div>
          <button 
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BetModal({ isOpen, onClose, onConfirm, tokenSymbol, betType }: BetModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError('');
      setIsProcessing(false);
      setShowErrorModal(false);
      setShowSuccessModal(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      setError('');

      if (!amount) {
        setError('Please enter an amount');
        setShowErrorModal(true);
        return;
      }

      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        setError('Please enter a valid positive amount');
        setShowErrorModal(true);
        return;
      }

      const decimals = amount.includes('.') ? amount.split('.')[1].length : 0;
      if (decimals > 18) {
        setError('Too many decimal places');
        setShowErrorModal(true);
        return;
      }

      await onConfirm(amount);
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
        onClose();
      }, 2000);

    } catch (e) {
      console.error('Betting error:', e);
      setError(e instanceof Error ? e.message : 'Error placing bet. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[50]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl z-[51]">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              {betType === 'hunt' ? '🎯 Hunt' : '🎣 Fish'} Bet
            </h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500 transition-colors"
              disabled={isProcessing}
            >
              <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
              Amount in {tokenSymbol}
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder={`Enter amount in ${tokenSymbol}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="0.000000000000000001"
              min="0"
              disabled={isProcessing}
            />
          </div>

          {/* Quick Amounts */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {['0.01', '0.05', '0.1', '0.5'].map((value) => (
              <button
                key={value}
                onClick={() => setAmount(value)}
                disabled={isProcessing}
                className="py-2 px-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors disabled:opacity-50"
              >
                {value}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!amount || isProcessing}
              className={`
                flex-1 px-4 py-3 text-white rounded-lg transition-colors
                ${betType === 'hunt'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-pink-500 hover:bg-pink-600'
                }
                disabled:opacity-50
              `}
            >
              {isProcessing ? 'Processing...' : `Confirm ${betType === 'hunt' ? '🎯' : '🎣'}`}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MessageModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={error}
        type="error"
      />
      <MessageModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message="Transaction initiated successfully!"
        type="success"
      />
    </div>
  );
}