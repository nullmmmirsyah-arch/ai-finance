'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis, Label, Legend } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import type { Record } from '@/types/Record';

interface ProcessedData {
  date: string; // YYYY-MM-DD normalized
  formattedDate: string; // MM/DD for X axis
  income: number;
  expense: number;
  incomeDetails: { text: string; amount: number; category: string }[];
  expenseDetails: { text: string; amount: number; category: string }[];
}

const ChartBarWithDetails = ({ records }: { records?: Record[] }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [windowWidth, setWindowWidth] = useState(1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;

  // Normalize date to YYYY-MM-DD (UTC)
  const normalizeDate = (dateInput: string | number | Date): string => {
    return new Date(dateInput).toISOString().split('T')[0];
  };

  // Helper: determine if a record is income
  const isIncomeType = (t: unknown) => {
    // Accept 'income' / 'INCOME' or anything that contains 'income'
    if (t === undefined || t === null) return false;
    return String(t).toLowerCase().includes('income');
  };

  // Aggregate into { date: { income, expense, incomeDetails[], expenseDetails[] } }
  const aggregateByDate = (recordsList: Record[]) => {
    const dateMap = new Map<
      string,
      {
        income: number;
        expense: number;
        incomeDetails: { text: string; amount: number; category: string }[];
        expenseDetails: { text: string; amount: number; category: string }[];
      }
    >();

    recordsList.forEach((record) => {
      if (!record || !record.date) return;

      const dateKey = normalizeDate(record.date);
      const existing = dateMap.get(dateKey);

      const detail = {
        text: record.text ?? '',
        amount: record.amount ?? 0,
        category: record.category ?? '',
      };

      const incomeFlag = isIncomeType(record.type);

      if (existing) {
        if (incomeFlag) {
          existing.income += record.amount;
          existing.incomeDetails.push(detail);
        } else {
          existing.expense += record.amount;
          existing.expenseDetails.push(detail);
        }
      } else {
        dateMap.set(dateKey, {
          income: incomeFlag ? record.amount : 0,
          expense: incomeFlag ? 0 : record.amount,
          incomeDetails: incomeFlag ? [detail] : [],
          expenseDetails: incomeFlag ? [] : [detail],
        });
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        income: data.income,
        expense: data.expense,
        incomeDetails: data.incomeDetails,
        expenseDetails: data.expenseDetails,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // safe fallback jika records undefined
  const safeRecords = Array.isArray(records) ? records : [];
  const aggregated = aggregateByDate(safeRecords);

  const chartData: ProcessedData[] = aggregated.map((item) => {
    const [, month, day] = item.date.split('-');
    return {
      date: item.date,
      formattedDate: `${month}/${day}`,
      income: item.income,
      expense: item.expense,
      incomeDetails: item.incomeDetails,
      expenseDetails: item.expenseDetails,
    };
  });

  const chartConfig = { amount: { label: 'Amount' } } satisfies ChartConfig;

  if (chartData.length === 0) {
    return (
      <div className="relative w-full h-64 sm:h-72 md:h-80 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50">
        <p className="text-gray-500 dark:text-gray-400">No data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 sm:h-72 md:h-80">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 5, right: 20, left: 20, bottom: 20 }}
        >
          <CartesianGrid vertical={false} stroke={isDark ? '#374151' : '#e0e0e0'} />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: isMobile ? 10 : 12 }}
            tickLine={false}
            axisLine={false}
            width={75}
            tickFormatter={(val) => `Rp ${Number(val).toLocaleString('id-ID')}`}
          >
            <Label
              angle={-90}
              position="left"
              offset={15}
              style={{ textAnchor: 'middle' }}
              value="Amount"
              fill={isDark ? '#e5e7eb' : '#374151'}
              fontSize={12}
            />
          </YAxis>

         

          
          

          {/* Tooltip kustom: menampilkan totals dan rincian grouped by tipe */}
          <ChartTooltip
            cursor={false}
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;

              // Ambil payload pertama, semua data sama (income+expense)
              const pd = payload[0].payload as ProcessedData;

              return (
                <div className="max-w-xs rounded-lg border bg-background p-3 shadow-lg">
                  <div className="mb-1 border-b pb-1">
                    <p className="font-semibold">{pd.formattedDate}</p>
                    <p className="text-lg font-bold">
                      Total Income: Rp {Number(pd.income).toLocaleString('id-ID')}
                    </p>
                    <p className="text-lg font-bold">
                      Total Expense: Rp {Number(pd.expense).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Income details */}
                  <div className="flex flex-col gap-1.5">
                    <p className="font-semibold text-green-600">Income — Rincian:</p>
                    {pd.incomeDetails.length === 0 && (
                      <div className="text-sm text-muted-foreground">Tidak ada income</div>
                    )}
                    {pd.incomeDetails.map((d, i) => (
                      <div
                        key={`inc-${i}`}
                        className="flex justify-between items-center text-sm border-b border-dashed last:border-none py-1"
                      >
                        <div className="flex flex-col">
                          <span>{d.text}</span>
                          <span className="text-xs text-muted-foreground">{d.category}</span>
                        </div>
                        <span className="font-medium">Rp {d.amount.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Expense details */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <p className="font-semibold text-red-600">Expense — Rincian:</p>
                    {pd.expenseDetails.length === 0 && (
                      <div className="text-sm text-muted-foreground">Tidak ada expense</div>
                    )}
                    {pd.expenseDetails.map((d, i) => (
                      <div
                        key={`exp-${i}`}
                        className="flex justify-between items-center text-sm border-b border-dashed last:border-none py-1"
                      >
                        <div className="flex flex-col">
                          <span>{d.text}</span>
                          <span className="text-xs text-muted-foreground">{d.category}</span>
                        </div>
                        <span className="font-medium">Rp {d.amount.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />

          <Legend 
            verticalAlign="top"
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 8 }} 
          />

          {/* Income bar (green) */}
          <Bar dataKey="income" name="Income" fill="#4caf50" radius={2}>
            {chartData.map((entry, index) => (
              // If income is zero, use a lighter fill so bar still "exists" visually if needed
              <Cell
                key={`income-cell-${index}`}
                fill={entry.income > 0 ? '#4caf50' : (isDark ? '#07320a' : '#e8f5e9')}
              />
            ))}
          </Bar>

          {/* Expense bar (red) */}
          <Bar dataKey="expense" name="Expense" fill="#f44336" radius={2}>
            {chartData.map((entry, index) => (
              <Cell
                key={`expense-cell-${index}`}
                fill={entry.expense > 0 ? '#f44336' : (isDark ? '#3a0f0f' : '#ffebee')}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default ChartBarWithDetails;
