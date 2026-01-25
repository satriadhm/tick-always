import Card from '@/components/ui/Card';

interface FinanceOverviewProps {
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
  balance: number;
}

export default function FinanceOverview({ totalIncome, totalExpense, totalInvestment, balance }: FinanceOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="space-y-2">
        <p className="text-sm text-[#8a8a8a] font-medium uppercase tracking-wide">Income</p>
        <p className="text-2xl font-bold text-[#6b8cce]">+Rp{totalIncome.toLocaleString('id-ID')}</p>
      </Card>
      
      <Card className="space-y-2">
        <p className="text-sm text-[#8a8a8a] font-medium uppercase tracking-wide">Expense</p>
        <p className="text-2xl font-bold text-[#ce6b6b]">-Rp{totalExpense.toLocaleString('id-ID')}</p>
      </Card>

      <Card className="space-y-2">
        <p className="text-sm text-[#8a8a8a] font-medium uppercase tracking-wide">Investment</p>
        <p className="text-2xl font-bold text-[#8dc9b6]">-Rp{totalInvestment.toLocaleString('id-ID')}</p>
      </Card>
      
      <Card className="space-y-2" >
        <p className="text-sm text-[#8a8a8a] font-medium uppercase tracking-wide">Balance</p>
        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-[#8dc9b6]' : 'text-[#ce6b6b]'}`}>
          Rp{balance.toLocaleString('id-ID')}
        </p>
      </Card>
    </div>
  );
}
