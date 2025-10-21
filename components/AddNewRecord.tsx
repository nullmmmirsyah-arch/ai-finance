'use client';
import { useRef, useState, useEffect } from 'react';
import addRecord from '@/app/actions/addRecord';
import { suggestCategory } from '@/app/actions/suggestCategory';
import { getAccounts } from '@/app/actions/accounts';
import { TransactionType } from '@/types/Record';
import { Account } from '@prisma/client';

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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      const { accounts, error } = await getAccounts();
      if (error) {
        console.error(error);
      } else if (accounts) {
        setAccounts(accounts);
        if (accounts.length > 0) {
          setSelectedAccount(accounts[0].id);
        }
      }
    };

    fetchAccounts();
  }, []);

  const clientAction = async (formData: FormData) => {
    setIsLoading(true);
    setAlertMessage(null);

    formData.set('amount', amount.toString());
    formData.set('category', category);
    formData.set('type', transactionType);
    formData.set('accountId', selectedAccount);

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
        setCategory(result.category || '');
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
    <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl'>
      <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
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
            {/* Account Selection */}
            <div className='space-y-1.5'>
              <label 
                htmlFor='account' 
                className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide'
              >
                <span className='w-1.5 h-1.5 bg-blue-500 rounded-full'></span>
                Account
              </label>
              <select
                id='account'
                name='accountId'
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className='w-full px-3 py-2.5 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/80 dark:border-gray-600/80 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-gray-700/90 focus:border-emerald-400 dark:focus:border-emerald-400 text-gray-900 dark:text-gray-100 cursor-pointer text-sm shadow-sm hover:shadow-md transition-all duration-200'
                required
              >
                <option value='' disabled>Select account...</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Expense Description and Date */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-900/10 dark:to-green-900/10 rounded-xl border border-emerald-100/50 dark:border-emerald-800/50'>
              {/* Expense Description */}
              <div className='space-y-1.5'>
                <label 
                  htmlFor='text' 
                  className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide'
                >
                  <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full'></span>
                  Description
                </label>
                <div className='relative'>
                <input
                  type='text'
                  id='text'
                  name='text'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className='w-full pl-3 pr-12 sm:pr-14 py-2.5 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/80 dark:border-gray-600/80 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-gray-700/90 focus:border-emerald-400 dark:focus:border-emerald-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm shadow-sm hover:shadow-md transition-all duration-200'
                  placeholder='e.g., Coffee, Salary'
                  required
                />
                <button 
                type='button' 
                onClick={handleAISuggestCategory} 
                disabled={isCategorizingAI}
                className='absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-7 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-mid)] hover:from-[var(--gradient-start)] hover:to-[var(--gradient-mid)] disabled:from-gray-300 disabled:to-gray-300 text-white rounded-lg text-xs font-medium flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-200'
                title='AI Category Suggestion'
                >
                  {isCategorizingAI ? (
                    <div className='w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                  ) : (
                    <span className='text-xs'>✨</span>
                  )}
                </button>
              </div>
              {isCategorizingAI && (
                <div className='flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400'>
                  <div className='w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse'></div>
                  AI is analyzing your description...
                </div>
              )}
            </div>
              {/* Expense Date */}    
              <div className='space-y-1.5'>
                <label 
                  htmlFor='date' 
                  className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide'
                >
                  <span className='w-1.5 h-1.5 bg-green-500 rounded-full'></span>
                  Date
                </label>
                <input
                  type='date'
                  name='date'
                  id='date'
                  className='w-full px-3 py-2.5 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/80 dark:border-gray-600/80 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-gray-700/90 focus:border-emerald-400 dark:focus:border-emerald-400 text-gray-900 dark:text-gray-100 text-sm shadow-sm hover:shadow-md transition-all duration-200'
                  required
                  onFocus={(e) => e.target.showPicker()}
                />
              </div>
            </div>
              
            {/* Category Selection and Amount */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl border border-green-100/50 dark:border-green-800/50'>
              {/* Category Selection */}
              <div className='space-y-1.5'>
                <label 
                htmlFor='category' 
                className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide'
              > 
                  <span className='w-1.5 h-1.5 bg-green-500 rounded-full'></span>
                  Category
                  <span className='text-xs text-gray-400 dark:text-gray-500 ml-2 font-normal hidden sm:inline'>
                  Use the ✨ button above for AI suggestions
                  </span>
                </label>
                <select
                  id='category'
                  name='category'
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className='w-full px-3 py-2.5 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/80 dark:border-gray-600/80 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-gray-700/90 focus:border-emerald-400 dark:focus:border-emerald-400 text-gray-900 dark:text-gray-100 cursor-pointer text-sm shadow-sm hover:shadow-md transition-all duration-200'
                  required
                >
                  <option 
                  value='' 
                  disabled
                  className='text-gray-400 dark:text-gray-500'
                  >
                    Select category...
                  </option>
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
            
            
            {/* Amount */}
            <div className='space-y-1.5'>
              <label 
                htmlFor='amount' 
                className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide'
              >
                <span className='w-1.5 h-1.5 bg-green-500 rounded-full'></span>
                Amount
                <span className='text-xs text-gray-400 dark:text-gray-500 ml-2 font-normal hidden sm:inline'>
                  Enter amount of transaction
                </span>
              </label>
              <div className='relative'>
                <span className='absolute left-1 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-sm'>
                  Rp
                </span>
                <input
                  type='number'
                  name='amount'
                  id='amount'
                  min='0'
                  step='1'
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className='w-full pl-6 pr-3 py-2.5 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/80 dark:border-gray-600/80 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-gray-700/90 focus:border-emerald-400 dark:focus:border-emerald-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200'
                  placeholder='0'
                  required
                />
              </div>
            </div>
          </div>
            
          {/* Submit Button */}
          <button 
            type='submit' 
            className='w-full relative overflow-hidden bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] hover:from-[var(--gradient-start)] hover:via-[var(--gradient-mid)] hover:to-[var(--gradient-end)] text-white px-4 py-3 sm:px-5 sm:py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl group transition-all duration-300 border-2 border-transparent hover:border-white/20 text-sm sm:text-base' 
            disabled={isLoading}
          >
            <div className='relative flex items-center justify-center gap-2'>
            {isLoading ? 'Processing...' : `Add ${transactionType === TransactionType.INCOME ? 'Income' : 'Expense'}`}
            </div>
          </button>
        </form>

        {/* Alert Message */}          
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
      </div>
    </div>
  );
};

export default AddNewRecord;