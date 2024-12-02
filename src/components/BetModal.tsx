import React, { useState, ChangeEvent } from 'react';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: string) => void;
  tokenSymbol: string;
  betType: 'hunt' | 'fish';
}

export default function BetModal({ isOpen, onClose, onConfirm, tokenSymbol, betType }: BetModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validateAndConfirm = () => {
    try {
      if (!amount) {
        setError('Please enter an amount');
        return;
      }

      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        setError('Please enter a valid positive amount');
        return;
      }

      const decimals = amount.includes('.') ? amount.split('.')[1].length : 0;
      if (decimals > 18) {
        setError('Too many decimal places');
        return;
      }

      onConfirm(amount);
      onClose();
      setAmount('');
      setError('');
    } catch (e) {
      setError('Invalid amount format');
    }
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    setError('');
  };

  const handleSuggestionClick = (value: string) => {
    setAmount(value);
    setError('');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div 
        className="relative bg-white rounded-xl w-full max-w-md mx-4 shadow-2xl" 
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {betType === 'hunt' ? '🎯 Hunt' : '🎣 Fish'} Bet
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors p-1"
            >
              <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700">
              Amount in {tokenSymbol}
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder={`Enter amount in ${tokenSymbol}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              step="0.000000000000000001"
              min="0"
            />
            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}
          </div>

          {/* Quick Amount Suggestions */}
          <div className="grid grid-cols-4 gap-3">
            {['0.01', '0.05', '0.1', '0.5'].map((value) => (
              <button
                key={value}
                onClick={() => handleSuggestionClick(value)}
                className="py-2 px-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 font-medium"
              >
                {value}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={validateAndConfirm}
              disabled={!amount || parseFloat(amount) <= 0}
              className={`
                flex-1 px-4 py-3 text-white rounded-lg transition-colors font-medium
                ${betType === 'hunt'
                  ? 'bg-green-500 hover:bg-green-600 disabled:bg-green-300'
                  : 'bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300'
                }
                disabled:cursor-not-allowed
              `}
            >
              Confirm {betType === 'hunt' ? '🎯' : '🎣'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}