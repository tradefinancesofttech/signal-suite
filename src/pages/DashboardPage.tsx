import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SignalsTable, SignalRowData, TimeframeSignal } from "@/components/dashboard/SignalsTable";
import { StatsCard, SignalsSummary } from "@/components/dashboard/StatsCard";
import { Activity, TrendingUp, Zap } from "lucide-react";
import { SignalType } from "@/components/dashboard/SignalBadge";
import { instruments } from "@/data/instruments";
import { DEFAULT_TIMEFRAMES } from "@/components/dashboard/TimeframeSelector";

// Generate random signal
const getRandomSignal = (): SignalType => {
  const signals: SignalType[] = ["buy", "sell", "neutral"];
  return signals[Math.floor(Math.random() * signals.length)];
};

const generateTimeframeSignals = (timeframes: string[] = DEFAULT_TIMEFRAMES): TimeframeSignal[] => {
  return timeframes.map((tf) => ({ timeframe: tf, signal: getRandomSignal() }));
};

// Initial mock data
const initialData: SignalRowData[] = [
  {
    id: "1",
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "us_stocks",
    indicator: "RSI",
    timeframes: generateTimeframeSignals(),
    lastPrice: 195.89,
    change: 2.45,
    changePercent: 1.27,
  },
  {
    id: "2",
    symbol: "BTC/USD",
    name: "Bitcoin",
    category: "crypto",
    indicator: "MACD",
    timeframes: generateTimeframeSignals(),
    lastPrice: 43256.00,
    change: -892.00,
    changePercent: -2.02,
  },
  {
    id: "3",
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    category: "forex",
    indicator: "Bollinger",
    timeframes: generateTimeframeSignals(),
    lastPrice: 1.0892,
    change: 0.0023,
    changePercent: 0.21,
  },
  {
    id: "4",
    symbol: "TSLA",
    name: "Tesla Inc.",
    category: "us_stocks",
    indicator: "EMA",
    timeframes: generateTimeframeSignals(),
    lastPrice: 248.50,
    change: -5.30,
    changePercent: -2.09,
  },
  {
    id: "5",
    symbol: "ETH/USD",
    name: "Ethereum",
    category: "crypto",
    indicator: "Stochastic",
    timeframes: generateTimeframeSignals(),
    lastPrice: 2285.40,
    change: 45.20,
    changePercent: 2.02,
  },
];

const DashboardPage = () => {
  const [tableData, setTableData] = useState<SignalRowData[]>(initialData);

  // Calculate signal counts from all timeframes
  const signalCounts = tableData.reduce(
    (acc, row) => {
      row.timeframes.forEach((tf) => {
        if (tf.signal === "buy") acc.buy++;
        else if (tf.signal === "sell") acc.sell++;
        else acc.neutral++;
      });
      return acc;
    },
    { buy: 0, sell: 0, neutral: 0 }
  );

  // Get unique indicators count
  const uniqueIndicators = new Set(tableData.map((row) => row.indicator)).size;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        licenseKey="PRO-2024-XXXX" 
        macAddress="A1:B2:C3:D4:E5:F6" 
      />
      
      <main className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Entries"
            value={tableData.length}
            subtitle="Signal configurations"
            icon={<Activity className="h-5 w-5" />}
          />
          <StatsCard
            title="Buy Signals"
            value={signalCounts.buy}
            subtitle="Active buy recommendations"
            trend="up"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatsCard
            title="Unique Indicators"
            value={uniqueIndicators}
            subtitle="In use across entries"
            icon={<Zap className="h-5 w-5" />}
          />
          <SignalsSummary
            buyCount={signalCounts.buy}
            sellCount={signalCounts.sell}
            neutralCount={signalCounts.neutral}
          />
        </div>

        {/* Signals Table */}
        <SignalsTable 
          data={tableData} 
          onDataChange={setTableData}
          instruments={instruments}
        />
      </main>
    </div>
  );
};

export default DashboardPage;
