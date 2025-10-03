'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis, Label } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Record } from '@/types/Record'; // Impor tipe Record dari file global

// Data yang telah diproses untuk chart
interface ProcessedData {
  date: string;
  amount: number;
  // Kita tambahkan 'details' untuk menyimpan rincian transaksi
  details: { text: string; amount: number; category: string }[];
  formattedDate: string;
  fill: string;
}

const ChartBarDetailedExpenses = ({ records }: { records: Record[] }) => {
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

  const normalizeDate = (dateInput: string | number | Date): string => {
    return new Date(dateInput).toISOString().split('T')[0];
  };

  const getAmountColor = (amount: number) => {
    if (amount > 1000000) return 'hsl(346.8 77.2% 49.8%)'; // Red
    if (amount > 500000) return 'hsl(47.9 95.8% 53.1%)'; // Yellow
    if (amount > 0) return 'hsl(204 100% 40%)';     // Blue
    return 'hsl(142.1 70.6% 45.3%)'; // Green
  };

  // 1. MODIFIKASI FUNGSI AGREGASI
  const aggregateByDate = (records: Record[]) => {
    const dateMap = new Map<
      string,
      { total: number; details: { text: string; amount: number; category: string }[] }
    >();

    records.forEach((record) => {
      // Pastikan record dan date valid sebelum diproses
      if (!record || !record.date) return;
      
      const dateKey = normalizeDate(record.date);
      const existing = dateMap.get(dateKey);

      const transactionDetail = {
        text: record.text,
        amount: record.amount,
        category: record.category,
      };

      if (existing) {
        existing.total += record.amount;
        existing.details.push(transactionDetail); // Tambahkan detail transaksi
      } else {
        dateMap.set(dateKey, {
          total: record.amount,
          details: [transactionDetail], // Mulai array detail dengan transaksi pertama
        });
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        amount: data.total,
        details: data.details, // Pastikan 'details' diteruskan
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const validRecords = records.filter(record => record && record.date);
  const aggregatedData = aggregateByDate(validRecords);
  
  const chartData: ProcessedData[] = aggregatedData.map((item) => {
    const [, month, day] = item.date.split('-');
    return {
      ...item,
      formattedDate: `${month}/${day}`,
      fill: getAmountColor(item.amount),
    };
  });
  
  const chartConfig = { amount: { label: 'Amount' } } satisfies ChartConfig;

  return (
    <div className="relative w-full h-64 sm:h-72 md:h-80">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid vertical={false} stroke={isDark ? '#374151' : '#e0e0e0'} />
          <XAxis
            dataKey="formattedDate"
            tick={{fontSize: isMobile? 10:12}}
            tickLine={false}
            axisLine={false}
          />
          <YAxis /* ...props lainnya sama... */ />

          {/* 2. MODIFIKASI TOOLTIP */}
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                className="max-w-xs rounded-lg border bg-background p-2 shadow-lg"
                indicator="dot"
                formatter={(value, name, props) => {
                  const { payload } = props as { payload: ProcessedData };
                  
                  return (
                    <div className="flex flex-col gap-2">
                      {/* Bagian Header: Tanggal dan Total */}
                      <div className="mb-1 border-b pb-1">
                        <p className="font-semibold">{payload.formattedDate}</p>
                        <p className="text-lg font-bold">
                          Total: Rp. {Number(value).toFixed(0)}
                        </p>
                      </div>

                      {/* Bagian Rincian Transaksi */}
                      <div className="flex flex-col gap-1.5">
                        <p className="font-semibold text-muted-foreground">Rincian Transaksi:</p>
                        {payload.details.map((detail, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div className="flex flex-col">
                              <span>{detail.text}</span>
                              <span className="text-xs text-muted-foreground">{detail.category}</span>
                            </div>
                            <span className="font-medium">Rp. {detail.amount.toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
            }
          />
          
          <Bar dataKey="amount" radius={2}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>

        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default ChartBarDetailedExpenses;