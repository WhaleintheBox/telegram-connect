import { useState, useEffect, ChangeEvent } from 'react';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: string) => void;
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

// Message Modal Component
function MessageModal({ isOpen, onClose, title, message, type = 'info' }: MessageModalProps) {
  if (!isOpen) return null;

  const getBgColor = () => {
    switch (type) {
      case 'error': return 'bg-red-100';
      case 'success': return 'bg-green-100';
      case 'loading': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error': return 'text-red-800';
      case 'success': return 'text-green-800';
      case 'loading': return 'text-blue-800';
      default: return 'text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-md mx-4 shadow-2xl">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
              <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>
          <div className={`p-4 rounded-lg ${getBgColor()} ${getTextColor()}`}>
            {message}
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Bet Modal Component
export default function BetModal({ isOpen, onClose, onConfirm, tokenSymbol, betType }: BetModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    try {
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

      onConfirm(amount);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        onClose();
      }, 2000);
    } catch (e) {
      setError('Invalid amount format');
      setShowErrorModal(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-[1000]">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-xl w-full max-w-md mx-4 shadow-2xl">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {betType === 'hunt' ? '🎯 Hunt' : '🎣 Fish'} Bet
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Amount in {tokenSymbol}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder={`Enter amount in ${tokenSymbol}`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.000000000000000001"
                min="0"
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              {['0.01', '0.05', '0.1', '0.5'].map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(value)}
                  className="py-2 px-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 font-medium"
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`
                  flex-1 px-4 py-3 text-white rounded-lg transition-colors font-medium
                  ${betType === 'hunt'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-pink-500 hover:bg-pink-600'
                  }
                `}
              >
                Confirm {betType === 'hunt' ? '🎯' : '🎣'}
              </button>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
}