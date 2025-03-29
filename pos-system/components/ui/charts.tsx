"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { 
  Bar, 
  BarChart as RechartsBarChart,
  Line, 
  LineChart as RechartsLineChart,
  Pie, 
  PieChart as RechartsPieChart, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Area,
  AreaChart as RechartsAreaChart
} from "recharts";

interface ChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter: (value: number) => string;
  yAxisWidth?: number;
}

interface PieChartProps {
  data: any[];
  index: string;
  category: string;
  colors?: string[];
  valueFormatter: (value: number) => string;
}

// Daylight theme colors - explicit coffee/tan colors
const DAYLIGHT_COLORS = [
  "#5c4f42", // Dark brown
  "#8c6542", // Medium brown
  "#a67c52", // Light brown
  "#c4a77d", // Tan
  "#e6ded5", // Beige
];


export function BarChart({ data, index, categories, colors = DAYLIGHT_COLORS, valueFormatter, yAxisWidth = 40 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart 
        data={data} 
        margin={{ top: 20, right: 20, left: 20, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d4c8bc" />
        <XAxis 
          dataKey={index} 
          tick={{ fill: '#3c2f1f' }}
          tickLine={{ stroke: '#8c7b6b' }}
          axisLine={{ stroke: '#d4c8bc' }}
          tickMargin={8}
        />
        <YAxis 
          width={yAxisWidth}
          tick={{ fill: '#3c2f1f' }}
          tickLine={{ stroke: '#8c7b6b' }}
          axisLine={{ stroke: '#d4c8bc' }}
          tickFormatter={(value) => valueFormatter(value)}
        />
        <Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          contentStyle={{ 
            backgroundColor: 'white', 
            borderColor: '#d4c8bc',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            color: '#3c2f1f'
          }}
          labelStyle={{ color: '#3c2f1f' }}
        />
        <Legend 
          formatter={(value) => <span style={{ color: '#3c2f1f', fontWeight: 500 }}>{value}</span>}
        />
        {categories.map((category, i) => (
          <Bar 
            key={category} 
            dataKey={category} 
            fill={colors[i % colors.length]} 
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function LineChart({ data, index, categories, colors = DAYLIGHT_COLORS, valueFormatter, yAxisWidth = 40 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart 
        data={data} 
        margin={{ top: 20, right: 20, left: 20, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d4c8bc" />
        <XAxis 
          dataKey={index} 
          tick={{ fill: '#3c2f1f' }}
          tickLine={{ stroke: '#8c7b6b' }}
          axisLine={{ stroke: '#d4c8bc' }}
          tickMargin={8}
        />
        <YAxis 
          width={yAxisWidth}
          tick={{ fill: '#3c2f1f' }}
          tickLine={{ stroke: '#8c7b6b' }}
          axisLine={{ stroke: '#d4c8bc' }}
          tickFormatter={(value) => valueFormatter(value)}
        />
        <Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          contentStyle={{ 
            backgroundColor: 'white', 
            borderColor: '#d4c8bc',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            color: '#3c2f1f'
          }}
          labelStyle={{ color: '#3c2f1f' }}
        />
        <Legend 
          formatter={(value) => <span style={{ color: '#3c2f1f', fontWeight: 500 }}>{value}</span>}
        />
        {categories.map((category, i) => (
          <Line 
            key={category} 
            type="monotone" 
            dataKey={category} 
            stroke={colors[i % colors.length]} 
            strokeWidth={2}
            dot={{ fill: colors[i % colors.length], r: 4 }}
            activeDot={{ r: 6, fill: colors[i % colors.length] }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

export function AreaChart({ data, index, categories, colors = DAYLIGHT_COLORS, valueFormatter, yAxisWidth = 40 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart 
        data={data} 
        margin={{ top: 20, right: 20, left: 20, bottom: 30 }}
      >
        <defs>
          {categories.map((category, i) => (
            <linearGradient key={`color-${category}`} id={`color-${category}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0.2}/>
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d4c8bc" />
        <XAxis 
          dataKey={index} 
          tick={{ fill: '#3c2f1f' }}
          tickLine={{ stroke: '#8c7b6b' }}
          axisLine={{ stroke: '#d4c8bc' }}
          tickMargin={8}
          tickFormatter={(value) => {
            // Format date strings to more descriptive labels
            if (typeof value === 'string' && value.includes('-')) {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              });
            }
            return value;
          }}
          interval="preserveStartEnd" // Show more ticks
          minTickGap={30} // Reduce gap between ticks for more frequency
        />
        <YAxis 
          width={yAxisWidth}
          tick={{ fill: '#3c2f1f' }}
          tickLine={{ stroke: '#8c7b6b' }}
          axisLine={{ stroke: '#d4c8bc' }}
          tickFormatter={(value) => valueFormatter(value)}
        />
        <Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          contentStyle={{ 
            backgroundColor: 'white', 
            borderColor: '#d4c8bc',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            color: '#3c2f1f'
          }}
          labelStyle={{ color: '#3c2f1f' }}
          labelFormatter={(label) => {
            // Format tooltip labels to be more descriptive
            if (typeof label === 'string' && label.includes('-')) {
              const date = new Date(label);
              return date.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              });
            }
            return label;
          }}
        />
        <Legend 
          formatter={(value) => <span style={{ color: '#3c2f1f', fontWeight: 500 }}>{value}</span>}
        />
        {categories.map((category, i) => (
          <Area 
            key={category} 
            type="monotone" 
            dataKey={category} 
            stroke={colors[i % colors.length]} 
            fillOpacity={1}
            fill={`url(#color-${category})`}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}

export function PieChart({ data, category, index, colors = DAYLIGHT_COLORS, valueFormatter }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart 
        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
      >
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={150}
          innerRadius={60}
          dataKey={category}
          nameKey={index}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          contentStyle={{ 
            backgroundColor: 'white', 
            borderColor: '#d4c8bc',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            color: '#3c2f1f'
          }}
          labelStyle={{ color: '#3c2f1f' }}
        />
        <Legend 
          formatter={(value) => <span style={{ color: '#3c2f1f', fontWeight: 500 }}>{value}</span>}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
} 