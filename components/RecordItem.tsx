'use client';
import { useState } from 'react';
import { Record, TransactionType } from '@/types/Record';
import deleteRecord from '@/app/actions/deleteRecord';

const getCategoryEmoji = (category: string, type: TransactionType) => {
  if (type === TransactionType.INCOME) {
    switch (category) {
      case 'Gaji':
        return '💰';
      default:
        return '💵';
    }
  }

  switch (category) {
    case 'Food':
      return '🍔';
    case 'Transportation':
      return '🚗';
    case 'Shopping':
      return '🛒';
    case 'Entertainment':
      return '🎬';
    case 'Bills':
      return '💡';
    case 'Healthcare':
      return '🏥';
    default:
      return '📦';
  }
};

const RecordItem = ({ record }: { record: Record }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteRecord = async (recordId: string) => {
    setIsLoading(true);
    await deleteRecord(recordId);
    setIsLoading(false);
  };

  const isIncome = record.type === TransactionType.INCOME;
  const borderColor = isIncome ? 'border-green-500' : 'border-red-500';
  const amountColor = isIncome ? 'text-green-600' : 'text-red-600';

  return (
    <li
      className={`relative group p-4 rounded-lg shadow-md border-l-4 ${borderColor} flex justify-between items-center`}
    >
      <div className='flex items-center'>
        <span className='text-2xl mr-4'>
          {getCategoryEmoji(record.category, record.type)}
        </span>
        <div>
          <p className='font-semibold'>{record.text}</p>
          <p className='text-sm text-gray-500'>{record.category}</p>
        </div>
      </div>
      <div className='text-right'>
        <p className={`font-bold ${amountColor}`}>
          {isIncome ? '+' : '-'} Rp. {record.amount.toLocaleString('id-ID')}
        </p>
        <p className='text-sm text-gray-500'>
          {new Date(record.date).toLocaleDateString()}
        </p>
      </div>
      {/* Delete button positioned absolutely in top-right corner */}
      <button
        onClick={() => handleDeleteRecord(record.id)}
        className={`absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-lg hover:shadow-xl border-2 border-white dark:border-gray-700 backdrop-blur-sm transform hover:scale-110 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 ${
          isLoading ? 'cursor-not-allowed scale-100' : ''
        }`}
        aria-label='Delete record'
        disabled={isLoading} // Disable button while loading
        title='Delete expense record'
      >
        {isLoading ? (
          <div className='w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin'></div>
        ) : (
          <svg
            className='w-3 h-3 sm:w-4 sm:h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        )}
      </button>
    </li>
  );
};

export default RecordItem;