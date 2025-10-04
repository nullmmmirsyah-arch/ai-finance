'use client';
import { useRef, useState } from 'react';
import addRecord from '@/app/actions/addRecord';
import { suggestCategory } from '@/app/actions/suggestCategory';
import { TransactionType } from '@/types/Record';

const AddNewRecord = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [amount, setAmount] = useState(0);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isCategorizingAI, setIsCategorizingAI] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>(
    TransactionType.EXPENSE
  );

  const clientAction = async (formData: FormData) => {
    setIsLoading(true);
    setAlertMessage(null);

    formData.set('amount', amount.toString());
    formData.set('category', category);
    formData.set('type', transactionType);

    const { error } = await addRecord(formData);

    if (error) {
      setAlertMessage(`Error: ${error}`);
      setAlertType('error');
    } else {
      setAlertMessage(`Record added successfully!`);
      setAlertType('success');
      formRef.current?.reset();
      setAmount(0);
      setCategory('');
      setDescription('');
    }

    setIsLoading(false);
  };

  const handleAISuggestCategory = async () => {
    if (!description.trim()) {
      setAlertMessage('Please enter a description first');
      setAlertType('error');
      return;
    }

    setIsCategorizingAI(true);
    setAlertMessage(null);

    try {
      const result = await suggestCategory(description, transactionType);
      if (result.error) {
        setAlertMessage(`AI Suggestion: ${result.error}`);
        setAlertType('error');
      } else {
        setCategory(result.category);
        setAlertMessage(`AI suggested category: ${result.category}`);
        setAlertType('success');
      }
    } catch {
      setAlertMessage('Failed to get AI category suggestion');
      setAlertType('error');
    } finally {
      setIsCategorizingAI(false);
    }
  };

  const incomeCategories = ['Gaji', 'Other'];
  const expenseCategories = [
    'Food',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills',
    'Healthcare',
    'Other',
  ];

  return (
    <div className='p-4'>
      <div className='flex justify-center mb-4'>
        <div className='flex space-x-2 p-1 bg-gray-200 rounded-lg'>
          <button
            onClick={() => setTransactionType(TransactionType.EXPENSE)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              transactionType === TransactionType.EXPENSE
                ? 'bg-red-500 text-white'
                : 'text-gray-700'
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => setTransactionType(TransactionType.INCOME)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              transactionType === TransactionType.INCOME
                ? 'bg-green-500 text-white'
                : 'text-gray-700'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      <h3 className='text-xl font-bold mb-4'>
        Add New {transactionType === TransactionType.INCOME ? 'Income' : 'Expense'}
      </h3>

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(formRef.current!);
          clientAction(formData);
        }}
        className='space-y-4'
      >
        <div>
          <label htmlFor='text' className='block text-sm font-medium'>
            Description
          </label>
          <input
            type='text'
            id='text'
            name='text'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='w-full p-2 border rounded'
            placeholder='e.g., Coffee, Salary'
            required
          />
          <button type='button' onClick={handleAISuggestCategory} disabled={isCategorizingAI}>
            {isCategorizingAI ? '...' : 'Suggest Category'}
          </button>
        </div>

        <div>
          <label htmlFor='date' className='block text-sm font-medium'>
            Date
          </label>
          <input
            type='date'
            name='date'
            id='date'
            className='w-full p-2 border rounded'
            required
          />
        </div>

        <div>
          <label htmlFor='category' className='block text-sm font-medium'>
            Category
          </label>
          <select
            id='category'
            name='category'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='w-full p-2 border rounded'
            required
          >
            <option value='' disabled>Select category...</option>
            {(transactionType === TransactionType.INCOME
              ? incomeCategories
              : expenseCategories
            ).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor='amount' className='block text-sm font-medium'>
            Amount
          </label>
          <input
            type='number'
            name='amount'
            id='amount'
            min='0'
            step='1'
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className='w-full p-2 border rounded'
            placeholder='0.00'
            required
          />
        </div>

        <button type='submit' className='w-full p-2 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 text-white border rounded' disabled={isLoading}>
          {isLoading ? 'Processing...' : `Add ${transactionType === TransactionType.INCOME ? 'Income' : 'Expense'}`}
        </button>
      </form>

      {alertMessage && (
        <div 
          className={`mt-4 p-3 rounded-xl border-l-4 backdrop-blur-sm ${
            alertType === 'success'
              ? 'bg-green-50/80 dark:bg-green-900/20 border-l-green-500 text-green-800 dark:text-green-200'
              : 'bg-red-50/80 dark:bg-red-900/20 border-l-red-500 text-red-800 dark:text-red-200'}`}
        >
          <div className='flex items-center gap-2'>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                alertType === 'success'
                  ? 'bg-green-100 dark:bg-green-800'
                  : 'bg-red-100 dark:bg-red-800'
              }`}
            >
              <span className='text-sm'>
                {alertType === 'success' ? '✅' : '⚠️'}
              </span>
            </div>
            <p className='font-medium text-sm'>{alertMessage}</p>
          
            </div>
        </div>
      )}
    </div>
  );
};

export default AddNewRecord;