'use client';

import { useState, useEffect, useCallback } from 'react';


import CategoryTable from '@/components/finance/CategoryTable';
import FinanceOverview from '@/components/finance/FinanceOverview';
import CategoryChart from '@/components/finance/CategoryChart';
import TransactionModal from '@/components/finance/TransactionModal';
import TransactionTable from '@/components/finance/TransactionTable';
import { ITransaction } from '@/types';

export default function MoneyPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expense' | 'investment' | 'trading'>('overview');
  const [stats, setStats] = useState({
    income: { total: 0, categories: [] },
    expense: { total: 0, categories: [] },
    investment: { total: 0, categories: [] },
    trading: { total: 0, categories: [] },
    balance: 0,
  });
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, transRes] = await Promise.all([
        fetch('/api/finance/stats'),
        fetch('/api/finance/transactions?limit=100')
      ]);

      const statsData = await statsRes.json();
      const transData = await transRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }
      if (transData.success) {
        setTransactions(transData.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveTransaction = async (data: Partial<ITransaction>) => {
    try {
      const method = editingTransaction ? 'PUT' : 'POST';
      const url = editingTransaction 
        ? `/api/finance/transactions/${editingTransaction._id}` 
        : '/api/finance/transactions';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fetchData(); 
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error saving transaction', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await fetch(`/api/finance/transactions/${id}`, {
        method: 'DELETE',
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting transaction', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6b8cce] border-t-transparent"></div>
      </div>
    );
  }

  // Dynamic tabs derived from stats data
  const categoryTypes = Object.keys(stats).filter(
    (key) => key !== 'balance' && typeof stats[key as keyof typeof stats] === 'object'
  ) as ('income' | 'expense' | 'investment' | 'trading')[];

  const tabs: { id: string; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    ...categoryTypes.map((type) => ({
      id: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    })),
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-8 pb-20">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-[#4a4a4a] mb-2">Money Tracker</h1>
          <p className="text-[#6b6b6b]">Financial overview &amp; transactions</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 p-2 rounded-2xl bg-[#e0e0e0] shadow-[inset_2px_2px_4px_rgba(190,190,190,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] w-full overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'income' | 'expense' | 'investment' | 'trading')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-[#e0e0e0] text-[#6b8cce] shadow-[-3px_-3px_6px_rgba(255,255,255,0.8),3px_3px_6px_rgba(190,190,190,0.8)] transform scale-[1.02]'
                : 'text-[#8a8a8a] hover:text-[#4a4a4a] hover:bg-[#e6e6e6]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>



      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            <FinanceOverview 
              totalIncome={stats.income.total}
              totalExpense={stats.expense.total}
              balance={stats.balance}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <CategoryChart 
                data={stats.expense.categories} 
                title="Expenses by Category" 
              />
              
              <CategoryTable 
                title="Expense Categories" 
                data={stats.expense.categories} 
                total={stats.expense.total}
                type="expense"
                color="#ce6b6b"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <CategoryChart 
                data={stats.investment.categories} 
                title="Investment Distribution" 
              />

              <CategoryTable 
                title="Investment Categories" 
                data={stats.investment.categories} 
                total={stats.investment.total}
                type="investment"
                color="#8dc9b6"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <CategoryTable 
                title="Income Categories" 
                data={stats.income.categories} 
                total={stats.income.total}
                type="income"
                color="#6b8cce"
              />

              <CategoryTable 
                title="Trading Categories" 
                data={stats.trading.categories} 
                total={stats.trading.total}
                type="trading"
                color="#d6b656"
              />
            </div>
          </div>
        ) : (
          <TransactionTable 
            type={activeTab}
            transactions={transactions.filter(t => t.type === activeTab)}
            onAdd={handleSaveTransaction}
            onDelete={handleDeleteTransaction}
            onEdit={(t) => {
              setEditingTransaction(t);
              setIsModalOpen(true);
            }}
          />
        )}
      </div>

      {isModalOpen && (
        <TransactionModal 
          transaction={editingTransaction}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveTransaction}
        />
      )}
    </div>
  );
}
