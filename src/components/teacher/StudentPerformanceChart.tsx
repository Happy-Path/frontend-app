
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Mock data for student performance
const mockData = [
  {
    name: 'Numbers',
    score: 85,
    progress: 100,
    average: 75,
  },
  {
    name: 'Letters',
    score: 70,
    progress: 80,
    average: 65,
  },
  {
    name: 'Colors',
    score: 90,
    progress: 100,
    average: 80,
  },
  {
    name: 'Shapes',
    score: 60,
    progress: 50,
    average: 70,
  },
  {
    name: 'Emotions',
    score: 75,
    progress: 60,
    average: 60,
  },
];

const StudentPerformanceChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={mockData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="score" name="Quiz Score" fill="#8884d8" />
          <Bar dataKey="progress" name="Progress %" fill="#82ca9d" />
          <Bar dataKey="average" name="Class Average" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentPerformanceChart;
