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
      className={`p-4 rounded-lg shadow-md border-l-4 ${borderColor} flex justify-between items-center`}
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
          {isIncome ? '+' : '-'} Rp. {record.amount.toFixed(2)}
        </p>
        <p className='text-sm text-gray-500'>
          {new Date(record.date).toLocaleDateString()}
        </p>
        <button onClick={() => handleDeleteRecord(record.id)} disabled={isLoading}>
          {isLoading ? '...' : 'Delete'}
        </button>
      </div>
    </li>
  );
};

export default RecordItem;