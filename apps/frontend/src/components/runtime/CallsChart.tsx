import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown } from 'lucide-react';

// Mock data for the chart
const generateChartData = (timeRange: string) => {
  const now = new Date();
  const data = [];

  let points = 24; // Default to 24 hours
  let interval = 1; // 1 hour intervals

  if (timeRange === 'Last 7 days') {
    points = 7;
    interval = 24; // 1 day intervals
  } else if (timeRange === 'Last 30 days') {
    points = 30;
    interval = 24; // 1 day intervals
  }

  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval * 60 * 60 * 1000);
    data.push({
      time: timeRange.includes('days')
        ? time.toLocaleDateString()
        : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      apiCalls: Math.floor(Math.random() * 200) + 50,
      errors: Math.floor(Math.random() * 10) + 1,
      rateLimitWarnings: Math.floor(Math.random() * 5),
    });
  }

  return data;
};

export function CallsChart() {
  const [timeRange, setTimeRange] = useState('Last 24 hours');
  const [chartData] = useState(() => generateChartData(timeRange));

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            API Calls vs Errors Over Time
          </CardTitle>

          <div className="flex items-center space-x-4">
            {/* Legend */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  API Calls
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Errors</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Rate Limit Warning
                </span>
              </div>
            </div>

            {/* Time Range Selector */}
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectValue />
                <ChevronDown className="h-4 w-4 ml-2" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 24 hours">Last 24 hours</SelectItem>
                <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                <SelectItem value="Last 30 days">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} yAxisId="left" />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                yAxisId="right"
                orientation="right"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="apiCalls"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                yAxisId="left"
              />
              <Line
                type="monotone"
                dataKey="errors"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                yAxisId="right"
              />
              <Line
                type="monotone"
                dataKey="rateLimitWarnings"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
