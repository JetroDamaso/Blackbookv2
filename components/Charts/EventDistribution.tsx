"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A simple pie chart";

// Default fallback data
const defaultChartData = [
  { eventType: "chrome", count: 275, fill: "var(--color-chrome)" },
  { eventType: "safari", count: 200, fill: "var(--color-safari)" },
  { eventType: "firefox", count: 187, fill: "var(--color-firefox)" },
];

const defaultChartConfig = {
  count: {
    label: "Bookings",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

interface ChartPieSimpleProps {
  data?: Array<{
    eventType: string;
    count: number;
    fill?: string;
  }>;
}

export function ChartPieSimple({ data }: ChartPieSimpleProps) {
  // Use provided data or fallback to default
  const chartData = data && data.length > 0 ? data : defaultChartData;

  // Generate chart config dynamically
  const chartConfig: ChartConfig = {
    count: {
      label: "Bookings",
    },
    ...chartData.reduce(
      (acc, item, index) => {
        const key = item.eventType.toLowerCase().replace(/\s+/g, "_");
        acc[key] = {
          label: item.eventType,
          color: `var(--chart-${(index % 5) + 1})`,
        };
        return acc;
      },
      {} as Record<string, { label: string; color: string }>
    ),
  };

  // Add fill colors to chart data if not provided
  const dataWithColors = chartData.map((item, index) => ({
    ...item,
    fill: item.fill || `var(--chart-${(index % 5) + 1})`,
  }));

  return (
    <div>
      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px] -my-2">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie data={dataWithColors} dataKey="count" nameKey="eventType" />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
