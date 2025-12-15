import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SignalsTable, SignalRowData } from "@/components/dashboard/SignalsTable";
import { StatsCard, SignalsSummary } from "@/components/dashboard/StatsCard";
import { Activity, TrendingUp, Zap } from "lucide-react";
import { SignalType } from "@/components/dashboard/SignalBadge";

// Available symbols for selection
const availableSymbols = [
  { symbol: "EURUSD", name: "Euro / US Dollar", price: 1.0892, change: 0.0023, changePercent: 0.21 },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", price: 1.2654, change: -0.0045, changePercent: -0.35 },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", price: 149.82, change: 0.56, changePercent: 0.38 },
  { symbol: "XAUUSD", name: "Gold / US Dollar", price: 2024.50, change: 12.30, changePercent: 0.61 },
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar", price: 43256.00, change: -892.00, changePercent: -2.02 },
  { symbol: "ETHUSD", name: "Ethereum / US Dollar", price: 2285.40, change: 45.20, changePercent: 2.02 },
  { symbol: "AAPL", name: "Apple Inc.", price: 195.89, change: 2.45, changePercent: 1.27 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.50, change: -5.30, changePercent: -2.09 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 141.80, change: 1.20, changePercent: 0.85 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.25, change: 3.15, changePercent: 1.80 },
];

// Generate random signal
const getRandomSignal = (): SignalType => {
  const signals: SignalType[] = ["buy", "sell", "neutral"];
  return signals[Math.floor(Math.random() * signals.length)];
};

// Initial mock data
const initialData: SignalRowData[] = [
  {
    id: "1",
    symbol: "EURUSD",
    name: "Euro / US Dollar",
    indicator: "RSI",
    timeframe: "1h",
    signal: getRandomSignal(),
    lastPrice: 1.0892,
    change: 0.0023,
    changePercent: 0.21,
  },
  {
    id: "2",
    symbol: "BTCUSD",
    name: "Bitcoin / US Dollar",
    indicator: "MACD",
    timeframe: "4h",
    signal: getRandomSignal(),
    lastPrice: 43256.00,
    change: -892.00,
    changePercent: -2.02,
  },
  {
    id: "3",
    symbol: "XAUUSD",
    name: "Gold / US Dollar",
    indicator: "Bollinger",
    timeframe: "1d",
    signal: getRandomSignal(),
    lastPrice: 2024.50,
    change: 12.30,
    changePercent: 0.61,
  },
  {
    id: "4",
    symbol: "EURUSD",
    name: "Euro / US Dollar",
    indicator: "EMA",
    timeframe: "15m",
    signal: getRandomSignal(),
    lastPrice: 1.0892,
    change: 0.0023,
    changePercent: 0.21,
  },
];

const DashboardPage = () => {
  const [tableData, setTableData] = useState<SignalRowData[]>(initialData);

  // Calculate signal counts
  const signalCounts = tableData.reduce(
    (acc, row) => {
      if (row.signal === "buy") acc.buy++;
      else if (row.signal === "sell") acc.sell++;
      else acc.neutral++;
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
          availableSymbols={availableSymbols}
        />
      </main>
    </div>
  );
};

export default DashboardPage;
