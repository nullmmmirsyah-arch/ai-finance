import getRecords from '@/app/actions/getRecords';
import ChartBarWithDetails from './BarChart';

const RecordChart = async () => {
  const { records, error } = await getRecords();

  if (error) {
    return <div>Error loading chart data</div>;
  }

  if (!records || records.length === 0) {
    return <div>No data to display</div>;
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl">
      <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
        <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg'>
            <span className='text-white text-sm sm:text-lg'>📊</span>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">
            Financial Chart
          </h3>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                Visual representation of your spending
          </p>
        </div>
      </div>
          <div className='overflow-x-auto'>
            <ChartBarWithDetails records={records} />
          </div>
        
      </div>
  );
};

export default RecordChart;
