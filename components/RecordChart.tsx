import getRecords from '@/app/actions/getRecords';
import BarChart from './BarChart';

const RecordChart = async () => {
  const { records, error } = await getRecords();

  if (error) {
    return <div>Error loading chart data</div>;
  }

  if (!records || records.length === 0) {
    return <div>No data to display</div>;
  }

  const chartData = records.map((record) => ({
    date: new Date(record.date).toLocaleDateString(),
    amount: record.amount,
    type: record.type,
  }));

  return (
    <div className='p-4'>
      <h3 className='text-xl font-bold mb-4'>Financial Chart</h3>
      <BarChart data={chartData} />
    </div>
  );
};

export default RecordChart;