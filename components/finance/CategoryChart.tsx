'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card from '@/components/ui/Card';

interface DataPoint {
  name: string;
  total: number;
  [key: string]: string | number;
}

interface CategoryChartProps {
  data: DataPoint[];
  title?: string;
}

const COLORS = ['#6b8cce', '#ce6b6b', '#8dc9b6', '#d6b656', '#9c7ec7', '#8a8a8a'];

export default function CategoryChart({ data, title = "Category Distribution" }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-[300px] flex items-center justify-center text-[#8a8a8a]">
        No data available
      </Card>
    );
  }

  return (
    <Card className="h-[350px] flex flex-col">
      <h3 className="text-lg font-semibold text-[#4a4a4a] mb-2">{title}</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="total"
              paddingAngle={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#e0e0e0" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#e0e0e0', borderRadius: '12px', border: 'none', boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)' }}
              itemStyle={{ color: '#4a4a4a' }}
              formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '10px' }}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
