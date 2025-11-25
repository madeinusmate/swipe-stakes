"use client";

/**
 * Price Chart Component
 *
 * Displays historical price data for market outcomes.
 * Simple line chart using CSS/SVG (no external charting library).
 *
 * CUSTOMIZE: Replace with recharts, chart.js, or your preferred library
 * for more advanced charting features.
 */

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Outcome, OutcomePriceCharts, PricePoint } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

type TimeFrame = "24h" | "7d" | "30d" | "all";

interface PriceChartProps {
  outcomes: Outcome[];
  selectedOutcomeId?: number;
}

// =============================================================================
// Simple SVG Line Chart
// =============================================================================

interface LineChartProps {
  data: PricePoint[];
  color?: string;
  height?: number;
}

function LineChart({ data, color = "#10b981", height = 120 }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground text-sm"
        style={{ height }}
      >
        No price data available
      </div>
    );
  }

  // Calculate bounds
  const prices = data.map((d) => d[1]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 0.1;

  // Normalize to chart dimensions
  const width = 100;
  const padding = 2;

  const points = data.map((point, i) => {
    const x = padding + ((width - padding * 2) * i) / (data.length - 1);
    const y = height - padding - ((point[1] - minPrice) / priceRange) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  // Create gradient area
  const areaD = `${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-full w-full"
      style={{ height }}
    >
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#gradient-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

      {/* Current price dot */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].split(",")[0]}
          cy={points[points.length - 1].split(",")[1]}
          r="3"
          fill={color}
        />
      )}
    </svg>
  );
}

// =============================================================================
// Price Chart Component
// =============================================================================

export function PriceChart({ outcomes, selectedOutcomeId }: PriceChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("7d");

  // Get the selected outcome or first outcome with chart data
  const selectedOutcome = selectedOutcomeId !== undefined
    ? outcomes.find((o) => o.id === selectedOutcomeId)
    : outcomes[0];

  const chartData = selectedOutcome?.priceCharts?.[timeFrame] ?? [];

  // Calculate price change
  const currentPrice = selectedOutcome?.price ?? 0;
  const startPrice = chartData.length > 0 ? chartData[0][1] : currentPrice;
  const priceChange = currentPrice - startPrice;
  const priceChangePercent = startPrice > 0 ? (priceChange / startPrice) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Header with timeframe selector */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold tabular-nums">
            {(currentPrice * 100).toFixed(1)}%
          </p>
          <p
            className={cn(
              "text-sm",
              priceChange >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            )}
          >
            {priceChange >= 0 ? "+" : ""}
            {priceChangePercent.toFixed(1)}% ({timeFrame})
          </p>
        </div>

        <Tabs value={timeFrame} onValueChange={(v) => setTimeFrame(v as TimeFrame)}>
          <TabsList>
            <TabsTrigger value="24h" className="text-xs">24H</TabsTrigger>
            <TabsTrigger value="7d" className="text-xs">7D</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs">30D</TabsTrigger>
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Chart */}
      <div className="rounded-lg border bg-card p-4">
        <LineChart
          data={chartData}
          color={priceChange >= 0 ? "#10b981" : "#f43f5e"}
          height={160}
        />
      </div>

      {/* Legend for multi-outcome */}
      {outcomes.length > 1 && (
        <div className="flex flex-wrap gap-4 text-sm">
          {outcomes.map((outcome, i) => (
            <div
              key={outcome.id}
              className={cn(
                "flex items-center gap-2",
                selectedOutcomeId === outcome.id && "font-medium"
              )}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: i === 0 ? "#10b981" : i === 1 ? "#f43f5e" : "#6366f1",
                }}
              />
              <span>{outcome.title}</span>
              <span className="text-muted-foreground">
                {(outcome.price * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

