'use client';

import { ITransaction } from '@/types';
import { format } from 'date-fns';
import Card from '@/components/ui/Card';

interface TransactionListProps {
  transactions: ITransaction[];
  onEdit: (transaction: ITransaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <Card className="text-center py-12 text-[#8a8a8a]">
        <p className="text-lg">No transactions yet</p>
        <p className="text-sm">Add one to start tracking!</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <h3 className="text-lg font-semibold text-[#4a4a4a]">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.map((t) => (
          <div 
            key={t._id.toString()} 
            className="flex items-center justify-between p-3 rounded-xl bg-[#e0e0e0] group transition-all duration-200"
            style={{ boxShadow: '-2px -2px 4px rgba(255,255,255,0.6), 2px 2px 4px rgba(190,190,190,0.6)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(190,190,190,0.8)]`}
              >
                {t.type === 'income' ? '💰' : '💸'}
              </div>
              <div>
                <p className="font-medium text-[#4a4a4a]">{t.category}</p>
                <p className="text-xs text-[#8a8a8a]">{format(new Date(t.date), 'MMM d, yyyy')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`font-bold ${t.type === 'income' ? 'text-[#6b8cce]' : 'text-[#ce6b6b]'}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
              </span>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEdit(t)}
                  className="p-1.5 rounded-lg text-[#6b6b6b] hover:text-[#4a4a4a] shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(190,190,190,0.8)] hover:shadow-[-2px_-2px_4px_rgba(255,255,255,0.8),2px_2px_4px_rgba(190,190,190,0.8)] transition-all"
                >
                  ✎
                </button>
                <button 
                  onClick={() => onDelete(t._id.toString())}
                  className="p-1.5 rounded-lg text-[#ce6b6b] hover:text-[#ab5656] shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(190,190,190,0.8)] hover:shadow-[-2px_-2px_4px_rgba(255,255,255,0.8),2px_2px_4px_rgba(190,190,190,0.8)] transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
