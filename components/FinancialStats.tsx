import React from 'react';
import { getFinancialSummary } from '@/app/actions/getFinancialSummary';

const FinancialStats = async () => {
  const { totalIncome, totalExpense, netFlow, error } = await getFinancialSummary();

  if (error) {
    return (
      <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg'>
        <p className='font-bold'>Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      <div className='bg-green-100 p-4 rounded-lg'>
        <h3 className='text-lg font-semibold text-green-800'>Total Income</h3>
        <p className='text-lg font-bold text-green-900'>Rp. {totalIncome?.toLocaleString('id-ID')}</p>
      </div>
      <div className='bg-red-100 p-4 rounded-lg'>
        <h3 className='text-lg font-semibold text-red-800'>Total Expense</h3>
        <p className='text-lg font-bold text-red-900'>Rp. {totalExpense?.toLocaleString('id-ID')}</p>
      </div>
      <div className='bg-blue-100 p-4 rounded-lg'>
        <h3 className='text-lg font-semibold text-blue-800'>Net Flow</h3>
        <p className='text-lg font-bold text-blue-900'>Rp. {netFlow?.toLocaleString('id-ID')}</p>
      </div>
    </div>
  );
};

export default FinancialStats;