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
      <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl'>
        <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
          <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg'>
            <span className='text-white text-sm sm:text-lg'>📊</span>
          </div>
          <div>
            <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100'>
              Finance Statistics
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
              Your Financial insights
            </p>
          </div>
        </div>

        <div className='space-y-3 sm:space-y-4'>
          {/* Net Flow */}
          <div className='bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-700 dark:to-blue-600 rounded-xl p-3 sm:p-4 border border-blue-200/50 dark:border-blue-600/50'>
            <div className='text-center'>
              <p className='text-xs font-medium text-blue-600 dark:text-blue-100 mb-2 tracking-wide uppercase'>
                Net Flow
              </p>
              <div className='text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2'>
                Rp. {netFlow?.toLocaleString('id-ID')}
              </div>
            </div>
        </div>

        {/* Total Income */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3'>
          <div className='bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm p-3 sm:p-4 rounded-xl border-l-4 border-l-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 bg-red-100 dark:bg-red-800 rounded-xl flex items-center justify-center flex-shrink-0'>
                <span className='text-sm leading-none text-red-600 dark:text-red-300 font-bold'>
                  ↓
                </span>
              </div>
              <div className='flex-1'>
                <h4 className='text-lg font-medium text-red-600 dark:text-red-300'>Total Expense</h4>
                <p className='text-lg font-bold text-red-600 dark:text-red-300'>Rp. {totalExpense?.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* Total Expense */}
          <div className='bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm p-3 sm:p-4 rounded-xl border-l-4 border-l-green-500 hover:bg-green-50 dark:hover:bg-green-900/30'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 bg-green-100 dark:bg-green-800 rounded-xl flex items-center justify-center flex-shrink-0'>
                <span className='text-sm leading-none text-green-600 dark:text-green-300 font-bold'>
                   ↑ 
                </span>
              </div>
              <div className='flex-1'>
                <h4 className='text-lg font-medium text-green-600 dark:text-green-300'>Total Income</h4>
                <p className='text-lg font-bold text-green-600 dark:text-green-300'>Rp. {totalIncome?.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
  );
};

export default FinancialStats;