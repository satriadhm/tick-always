'use client';

import Card from '@/components/ui/Card';

interface CategoryData {
  name: string;
  count: number;
  total: number;
}

interface CategoryTableProps {
  title: string;
  data: CategoryData[];
  total: number;
  type: 'income' | 'expense' | 'investment' | 'trading';
  color: string;
}

export default function CategoryTable({ title, data, total, color }: CategoryTableProps) {
  return (
    <Card className="h-full flex flex-col">
      <h3 className="text-lg font-bold mb-4" style={{ color }}>{title}</h3>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-[#4a4a4a]">
          <thead>
            <tr className="border-b border-[#bebebe]">
              <th className="text-left pb-2 font-semibold">Category</th>
              <th className="text-center pb-2 font-semibold">Freq</th>
              <th className="text-right pb-2 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-[#8a8a8a]">No data</td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="border-b border-[#e0e0e0] last:border-0 hover:bg-[#d4d4d4] transition-colors">
                  <td className="py-2 pl-1">{item.name}</td>
                  <td className="text-center py-2">{item.count}</td>
                  <td className="text-right py-2 pr-1 font-medium">Rp {item.total.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t-2 border-[#bebebe] flex justify-between items-center">
        <span className="font-bold text-[#4a4a4a]">TOTAL</span>
        <span className="font-bold text-lg" style={{ color }}>Rp {total.toLocaleString()}</span>
      </div>
    </Card>
  );
}
