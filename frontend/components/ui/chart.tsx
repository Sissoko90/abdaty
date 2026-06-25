'use client';

import { cn } from '@/lib/utils';

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  className?: string;
}

export function BarChart({ data, className }: BarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className={cn('w-full space-y-4', className)}>
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                {item.label}
              </span>
              <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {item.value}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors duration-300">
              <div
                className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface LineChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  className?: string;
}

export function LineChart({ data, className }: LineChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value));
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (item.value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={cn('w-full', className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-48"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-200 dark:text-gray-700"
          />
        ))}
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary-600 dark:text-primary-500"
        />
        
        {/* Points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - (item.value / maxValue) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="currentColor"
              className="text-primary-600 dark:text-primary-500"
            />
          );
        })}
      </svg>
      
      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}
