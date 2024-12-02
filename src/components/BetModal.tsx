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

      // Validate that the amount has a reasonable number of decimal places
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl" 
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {betType === 'hunt' ? '🎯 Hunt' : '🎣 Fish'} Bet
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount in {tokenSymbol}
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder={`Enter amount in ${tokenSymbol}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="0.000000000000000001"
              min="0"
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Quick Amount Suggestions */}
          <div className="grid grid-cols-4 gap-2">
            {['0.01', '0.05', '0.1', '0.5'].map((value) => (
              <button
                key={value}
                onClick={() => handleSuggestionClick(value)}
                className="px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {value}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={validateAndConfirm}
              disabled={!amount || parseFloat(amount) <= 0}
              className={`
                flex-1 px-4 py-2 text-white rounded-md transition-colors
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