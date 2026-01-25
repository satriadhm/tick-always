'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ITransaction } from '@/types';
import { TRANSACTION_CATEGORIES } from '@/lib/constants/categories';

interface TransactionModalProps {
  transaction?: ITransaction | null;
  onClose: () => void;
  onSave: (transaction: Partial<ITransaction>) => Promise<void>;
}

export default function TransactionModal({ transaction, onClose, onSave }: TransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense' | 'investment' | 'trading'>('expense');
  const [flow, setFlow] = useState<'in' | 'out'>('out'); // 'in' = inflow (sell/income), 'out' = outflow (buy/expense)
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('1');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      
      const freq = transaction.frequency || 1;
      const totalAmount = transaction.amount;
      
      // Determine flow based on amount sign and type
      // Income is always +, Expense always + (in DB, handled by logic usually, but here we treat input as abs)
      // Investment/Trading: + is Outflow (Buy), - is Inflow (Sell)
      if (transaction.type === 'investment' || transaction.type === 'trading') {
        if (totalAmount < 0) {
          setFlow('in');
        } else {
          setFlow('out');
        }
      } else {
        // For income/expense, flow is implicit but let's set defaults
        setFlow(transaction.type === 'income' ? 'in' : 'out');
      }

      const unitAmount = Math.abs(totalAmount) / freq;
      setAmount(formatIDR(unitAmount));
      setFrequency(freq.toString());
      setCategory(transaction.category);
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
      setDescription(transaction.description || '');
    } else {
      // Defaults for new transaction
      setType('expense');
      setFlow('out');
      setAmount('');
      setFrequency('1');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
  }, [transaction]);

  const formatIDR = (value: number | string) => {
    if (!value) return '';
    const numberString = value.toString().replace(/[^0-9]/g, '');
    const number = parseFloat(numberString);
    if (isNaN(number)) return '';
    return 'Rp ' + number.toLocaleString('id-ID');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const rawValue = value.replace(/[^0-9]/g, '');
    
    if (!rawValue) {
      setAmount('');
      return;
    }

    const numberValue = parseFloat(rawValue);
    setAmount('Rp ' + numberValue.toLocaleString('id-ID'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const cleanAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
      const freq = parseInt(frequency) || 1;
      
      let finalAmount = cleanAmount * freq;

      // Business Logic for Sign:
      // Income: Always Positive
      // Expense: Always Positive (Logic elsewhere subtracts it, or we store negative? 
      // Based on current stats route: `totalAmount: { $sum: '$amount' }` and 
      // balance = income - (expense + investment + trading)
      // This implies Expense, Investment, Trading should be POSITIVE when they are outflows.
      
      // If Investment/Trading is 'in' (Sell), it should be NEGATIVE so that:
      // minus (negative) becomes plus.
      // e.g. Balance = ... - (-100) = ... + 100.
      
      if (type === 'investment' || type === 'trading') {
        if (flow === 'in') {
          finalAmount = -finalAmount;
        }
      }

      await onSave({
        type,
        amount: finalAmount,
        frequency: freq,
        category,
        date: new Date(date),
        description,
      } as ITransaction); 
      onClose();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset flow when type changes
  const handleTypeChange = (newType: 'income' | 'expense' | 'investment' | 'trading') => {
    setType(newType);
    if (newType === 'income') setFlow('in');
    else if (newType === 'expense') setFlow('out');
    else setFlow('out'); // Default to buy for invest/trading
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-[#4a4a4a] mb-6">
          {transaction ? 'Edit Transaction' : 'New Transaction'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Type Toggle */}
          <div className="grid grid-cols-4 gap-2 bg-[#e0e0e0] p-1 rounded-xl shadow-[inset_2px_2px_4px_rgba(190,190,190,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
            <button
              type="button"
              className={`py-2 rounded-lg text-xs font-medium transition-all ${
                type === 'income' 
                  ? 'bg-[#e0e0e0] text-[#6b8cce] shadow-[-2px_-2px_4px_rgba(255,255,255,0.8),2px_2px_4px_rgba(190,190,190,0.8)]' 
                  : 'text-[#8a8a8a] bg-transparent'
              }`}
              onClick={() => handleTypeChange('income')}
            >
              Income
            </button>
            <button
              type="button"
              className={`py-2 rounded-lg text-xs font-medium transition-all ${
                type === 'expense' 
                  ? 'bg-[#e0e0e0] text-[#ce6b6b] shadow-[-2px_-2px_4px_rgba(255,255,255,0.8),2px_2px_4px_rgba(190,190,190,0.8)]' 
                  : 'text-[#8a8a8a] bg-transparent'
              }`}
              onClick={() => handleTypeChange('expense')}
            >
              Expense
            </button>
            <button
              type="button"
              className={`py-2 rounded-lg text-xs font-medium transition-all ${
                type === 'investment' 
                  ? 'bg-[#e0e0e0] text-[#8dc9b6] shadow-[-2px_-2px_4px_rgba(255,255,255,0.8),2px_2px_4px_rgba(190,190,190,0.8)]' 
                  : 'text-[#8a8a8a] bg-transparent'
              }`}
              onClick={() => handleTypeChange('investment')}
            >
              Invest
            </button>
            <button
              type="button"
              className={`py-2 rounded-lg text-xs font-medium transition-all ${
                type === 'trading' 
                  ? 'bg-[#e0e0e0] text-[#d6b656] shadow-[-2px_-2px_4px_rgba(255,255,255,0.8),2px_2px_4px_rgba(190,190,190,0.8)]' 
                  : 'text-[#8a8a8a] bg-transparent'
              }`}
              onClick={() => handleTypeChange('trading')}
            >
              Trading
            </button>
          </div>

          {/* Flow Toggle for Investment/Trading */}
          {(type === 'investment' || type === 'trading') && (
             <div className="flex gap-4 items-center justify-center p-2 bg-[#f0f0f0] rounded-xl">
               <span className="text-xs font-bold text-[#6b6b6b] uppercase">Action:</span>
               <div className="flex gap-2">
                 <button
                   type="button"
                   onClick={() => setFlow('out')}
                   className={`px-4 py-1 rounded-lg text-xs font-bold transition-all ${
                     flow === 'out'
                       ? 'bg-[#ce6b6b] text-white shadow-md'
                       : 'bg-[#e0e0e0] text-[#8a8a8a]'
                   }`}
                 >
                   BUY (Out)
                 </button>
                 <button
                   type="button"
                   onClick={() => setFlow('in')}
                   className={`px-4 py-1 rounded-lg text-xs font-bold transition-all ${
                     flow === 'in'
                       ? 'bg-[#6b8cce] text-white shadow-md'
                       : 'bg-[#e0e0e0] text-[#8a8a8a]'
                   }`}
                 >
                   SELL (In)
                 </button>
               </div>
             </div>
          )}

          <div className="flex gap-4">
             <div className="flex-1">
               <Input 
                 label="Amount (per item)" 
                 type="text" 
                 placeholder="Rp 0"
                 value={amount} 
                 onChange={handleAmountChange}
                 required
                 autoFocus
               />
             </div>
             <div className="w-[100px]">
               <Input 
                 label="Freq" 
                 type="number" 
                 min="1"
                 value={frequency} 
                 onChange={(e) => setFrequency(e.target.value)}
                 required
               />
             </div>
          </div>

          <Input 
            label="Category" 
            placeholder="e.g. Stock, Crypto, Gold"
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            required
            list="categories"
          />
          <datalist id="categories">
            {TRANSACTION_CATEGORIES[type]?.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>

          <Input 
            label="Date" 
            type="date"
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Input 
            label="Description (Optional)" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
