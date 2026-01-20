'use client';
import { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CategoryTable from '@/components/finance/CategoryTable';
import TransactionModal from '@/components/finance/TransactionModal';
import { ITransaction } from '@/types';

export default function MoneyPage() {
  const [stats, setStats] = useState({
    income: { total: 0, categories: [] },
    expense: { total: 0, categories: [] },
    investment: { total: 0, categories: [] },
    trading: { total: 0, categories: [] },
    balance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const statsRes = await fetch('/api/finance/stats');
      const statsData = await statsRes.json();

      if (statsData.success) {
        setStats(statsData.data);
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
      await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fetchData(); 
    } catch (error) {
      console.error('Error saving transaction', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6b8cce] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-8 pb-20">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-[#4a4a4a] mb-2">Money Tracker</h1>
          <p className="text-[#6b6b6b]">Financial overview by category</p>
        </div>
        <Button 
          onClick={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <span>+</span> Add Transaction
        </Button>
      </header>

      {/* Summary Card */}
      <Card className="bg-[#e0e0e0] border-l-4 border-[#8dc9b6]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#4a4a4a]">Sisa (Remaining Balance)</h2>
            <p className="text-sm text-[#6b6b6b]">Income - (Expense + Investment + Trading)</p>
          </div>
          <p className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-[#8dc9b6]' : 'text-[#ce6b6b]'}`}>
            Rp {stats.balance.toLocaleString()}
          </p>
        </div>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Row 1 */}
        <CategoryTable 
          title="Jenis Pengeluaran (Expense)" 
          data={stats.expense.categories} 
          total={stats.expense.total}
          type="expense"
          color="#ce6b6b"
        />
        
        <CategoryTable 
          title="Jenis Investasi (Investment)" 
          data={stats.investment.categories} 
          total={stats.investment.total}
          type="investment"
          color="#8dc9b6"
        />

        {/* Row 2 */}
        <CategoryTable 
          title="Jenis Pemasukan (Income)" 
          data={stats.income.categories} 
          total={stats.income.total}
          type="income"
          color="#6b8cce"
        />

        <CategoryTable 
          title="Jenis Trading" 
          data={stats.trading.categories} 
          total={stats.trading.total}
          type="trading"
          color="#d6b656"
        />
      </div>

      {isModalOpen && (
        <TransactionModal 
          transaction={editingTransaction}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTransaction}
        />
      )}
    </div>
  );
}
