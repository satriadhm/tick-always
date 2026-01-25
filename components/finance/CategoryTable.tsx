import { useState, useEffect } from 'react';
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
  itemsPerPage?: number;
}

export default function CategoryTable({ title, data, total, color, itemsPerPage = 5 }: CategoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [prevData, setPrevData] = useState(data);

  if (data !== prevData) {
    setPrevData(data);
    setCurrentPage(1);
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold" style={{ color }}>{title}</h3>
        {totalPages > 1 && (
          <span className="text-xs text-[#8a8a8a]">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-auto min-h-[200px]">
        <table className="w-full text-sm text-[#4a4a4a]">
          <thead>
            <tr className="border-b border-[#bebebe]">
              <th className="text-left pb-2 font-semibold">Category</th>
              <th className="text-center pb-2 font-semibold">Freq</th>
              <th className="text-right pb-2 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-[#8a8a8a]">No data</td>
              </tr>
            ) : (
              currentData.map((item, index) => (
                <tr key={`${item.name}-${index}`} className="border-b border-[#e0e0e0] last:border-0 hover:bg-[#d4d4d4] transition-colors">
                  <td className="py-2 pl-1">{item.name}</td>
                  <td className="text-center py-2">{item.count}</td>
                  <td className="text-right py-2 pr-1 font-medium">Rp {item.total.toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t-2 border-[#bebebe] space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-[#4a4a4a]">TOTAL</span>
          <span className="font-bold text-lg" style={{ color }}>Rp {total.toLocaleString('id-ID')}</span>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-1">
             <button 
               onClick={handlePrev} 
               disabled={currentPage === 1}
               className={`px-3 py-1 text-xs rounded-md transition-colors ${
                 currentPage === 1 
                   ? 'text-[#bebebe] cursor-not-allowed' 
                   : 'text-[#4a4a4a] hover:bg-[#d4d4d4] font-medium'
               }`}
             >
               Previous
             </button>
             <button 
               onClick={handleNext} 
               disabled={currentPage === totalPages}
               className={`px-3 py-1 text-xs rounded-md transition-colors ${
                 currentPage === totalPages 
                   ? 'text-[#bebebe] cursor-not-allowed' 
                   : 'text-[#4a4a4a] hover:bg-[#d4d4d4] font-medium'
               }`}
             >
               Next
             </button>
          </div>
        )}
      </div>
    </Card>
  );
}
