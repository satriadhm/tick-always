'use client';

import { useState } from 'react';
import { ITransaction } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { format } from 'date-fns';

interface TransactionTableProps {
  transactions: ITransaction[];
  onAdd: (transaction: Partial<ITransaction>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (transaction: ITransaction) => void;
  type: 'income' | 'expense' | 'investment' | 'trading';
}

export default function TransactionTable({ transactions, onAdd, onDelete, onEdit, type }: TransactionTableProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        type,
        date: new Date(date),
        category,
        description,
        amount: parseFloat(amount),
      });
      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Failed to add transaction', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (tType: string) => {
    switch (tType) {
      case 'income': return 'text-[#6b8cce]';
      case 'expense': return 'text-[#ce6b6b]';
      case 'investment': return 'text-[#8dc9b6]';
      case 'trading': return 'text-[#d6b656]';
      default: return 'text-[#4a4a4a]';
    }
  };

  const colorClass = getCategoryColor(type);

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-[#d1d1d1]">
              <th className="p-4 font-semibold text-[#4a4a4a] w-[150px]">Date</th>
              <th className="p-4 font-semibold text-[#4a4a4a] w-[200px]">Category</th>
              <th className="p-4 font-semibold text-[#4a4a4a]">Description</th>
              <th className="p-4 font-semibold text-[#4a4a4a] text-right w-[150px]">Amount</th>
              <th className="p-4 font-semibold text-[#4a4a4a] w-[100px] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Input Row */}
            <tr className="bg-[#e6e6e6] border-b border-[#d1d1d1]">
              <td className="p-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#e0e0e0] p-2 rounded-lg text-sm text-[#4a4a4a] outline-none shadow-[inset_2px_2px_4px_rgba(190,190,190,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:shadow-[inset_3px_3px_6px_rgba(180,180,180,0.7),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] transition-all"
                  required
                />
              </td>
              <td className="p-2">
                <input
                  type="text"
                  placeholder="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  list={`${type}-categories`}
                  className="w-full bg-[#e0e0e0] p-2 rounded-lg text-sm text-[#4a4a4a] outline-none shadow-[inset_2px_2px_4px_rgba(190,190,190,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:shadow-[inset_3px_3px_6px_rgba(180,180,180,0.7),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] transition-all"
                  required
                />
                <datalist id={`${type}-categories`}>
                  {[
                    'Food', 'Transport', 'Housing', 'Utilities', 'Health', 
                    'Entertainment', 'Shopping', 'Salary', 'Investment', 'Trading'
                  ].map(c => <option key={c} value={c} />)}
                </datalist>
              </td>
              <td className="p-2">
                <input
                  type="text"
                  placeholder="Description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#e0e0e0] p-2 rounded-lg text-sm text-[#4a4a4a] outline-none shadow-[inset_2px_2px_4px_rgba(190,190,190,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:shadow-[inset_3px_3px_6px_rgba(180,180,180,0.7),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] transition-all"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  className="w-full bg-[#e0e0e0] p-2 rounded-lg text-sm text-[#4a4a4a] text-right outline-none shadow-[inset_2px_2px_4px_rgba(190,190,190,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:shadow-[inset_3px_3px_6px_rgba(180,180,180,0.7),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] transition-all"
                  required
                />
              </td>
              <td className="p-2 text-center">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="w-full py-2 text-xs"
                >
                  {isSubmitting ? '...' : 'Add'}
                </Button>
              </td>
            </tr>

            {/* Transaction Rows */}
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#8a8a8a]">
                  No {type} transactions found. Add one above!
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t._id.toString()} className="border-b border-[#e0e0e0] hover:bg-[#f0f0f0] transition-colors group">
                  <td className="p-4 text-[#6b6b6b] text-sm">
                    {format(new Date(t.date), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4 font-medium text-[#4a4a4a]">
                    {t.category}
                  </td>
                  <td className="p-4 text-[#6b6b6b] text-sm">
                    {t.description || '-'}
                  </td>
                  <td className={`p-4 text-right font-bold ${colorClass}`}>
                    {type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
                    <button 
                      onClick={() => onEdit(t)}
                      className="p-1.5 rounded-lg text-[#6b6b6b] hover:text-[#4a4a4a] hover:bg-[#d4d4d4] transition-all"
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button 
                      onClick={() => onDelete(t._id.toString())}
                      className="p-1.5 rounded-lg text-[#ce6b6b] hover:text-[#ab5656] hover:bg-[#d4d4d4] transition-all"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
