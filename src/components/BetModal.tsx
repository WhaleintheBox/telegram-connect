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
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <div className={`mt-4 p-4 rounded-lg ${getBgColor()} ${getTextColor()}`}>
                {message}
              </div>
              <div className="mt-4">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Bet Modal Component
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
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />

          {/* Modal Panel */}
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                  {betType === 'hunt' ? '🎯 Hunt' : '🎣 Fish'} Bet
                </h3>

                <div className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount in {tokenSymbol}
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setAmount(e.target.value);
                          setError('');
                        }}
                        className="block w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder={`Enter amount in ${tokenSymbol}`}
                        step="0.000000000000000001"
                        min="0"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {['0.01', '0.05', '0.1', '0.5'].map((value) => (
                        <button
                          key={value}
                          onClick={() => setAmount(value)}
                          className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="flex-1 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`flex-1 justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${
                  betType === 'hunt'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-pink-600 hover:bg-pink-700'
                }`}
                disabled={!amount}
              >
                Confirm {betType === 'hunt' ? '🎯' : '🎣'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modals */}
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