
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Mock data for student emotions and attention
const mockData = [
  {
    name: 'Mon',
    attention: 90,
    happiness: 85,
  },
  {
    name: 'Tue',
    attention: 75,
    happiness: 70,
  },
  {
    name: 'Wed',
    attention: 60,
    happiness: 65,
  },
  {
    name: 'Thu',
    attention: 80,
    happiness: 75,
  },
  {
    name: 'Fri',
    attention: 85,
    happiness: 80,
  },
  {
    name: 'Sat',
    attention: 95,
    happiness: 90,
  },
  {
    name: 'Sun',
    attention: 92,
    happiness: 88,
  },
];

const StudentEmotionChart = () => {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={mockData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="attention" 
            name="Attention Score" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="happiness" 
            name="Happiness Level" 
            stroke="#82ca9d" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentEmotionChart;
