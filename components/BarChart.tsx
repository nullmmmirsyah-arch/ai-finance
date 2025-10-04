'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { TransactionType } from '@/types/Record';

interface ChartData {
  date: string;
  income: number;
  expense: number;
}

interface BarChartProps {
  data: {
    date: string;
    amount: number;
    type: TransactionType;
  }[];
}

const FinancialBarChart = ({ data }: BarChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const aggregatedData = data.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = { date, income: 0, expense: 0 };
    }

    if (record.type === TransactionType.INCOME) {
      acc[date].income += record.amount;
    } else {
      acc[date].expense += record.amount;
    }

    return acc;
  }, {} as Record<string, ChartData>);

  const chartData = Object.values(aggregatedData);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#555' : '#ccc'} />
        <XAxis dataKey="date" stroke={isDark ? '#fff' : '#000'} />
        <YAxis stroke={isDark ? '#fff' : '#000'} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#333' : '#fff',
            borderColor: isDark ? '#555' : '#ccc',
          }}
        />
        <Legend />
        <Bar dataKey="income" fill="#4caf50" name="Income" />
        <Bar dataKey="expense" fill="#f44336" name="Expense" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FinancialBarChart;