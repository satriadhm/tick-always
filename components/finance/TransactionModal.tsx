'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ITransaction } from '@/types';

interface TransactionModalProps {
  transaction?: ITransaction | null;
  onClose: () => void;
  onSave: (transaction: Partial<ITransaction>) => Promise<void>;
}

export default function TransactionModal({ transaction, onClose, onSave }: TransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense' | 'investment' | 'trading'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
      setDescription(transaction.description || '');
    } else {
      // Defaults for new transaction
      setType('expense');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        type,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        description,
      } as ITransaction); // Cast to help TS unless we define a separate input type
      onClose();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    } finally {
      setIsSaving(false);
    }
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
              onClick={() => setType('income')}
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
              onClick={() => setType('expense')}
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
              onClick={() => setType('investment')}
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
              onClick={() => setType('trading')}
            >
              Trading
            </button>
          </div>

          <Input 
            label="Amount" 
            type="number" 
            step="0.01"
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
          />

          <Input 
            label="Category" 
            placeholder="e.g. Food, Salary, Rent"
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            required
            list="categories"
          />
          <datalist id="categories">
            <option value="Food" />
            <option value="Transport" />
            <option value="Salary" />
            <option value="Rent" />
            <option value="Utilities" />
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
