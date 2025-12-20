import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SignalsTable, SignalRowData, TimeframeSignal, AccuracyResult } from "@/components/dashboard/SignalsTable";
import { StatsCard, SignalsSummary } from "@/components/dashboard/StatsCard";
import { Activity, TrendingUp, Zap } from "lucide-react";
import { SignalType } from "@/components/dashboard/SignalBadge";
import { instruments } from "@/data/instruments";
import { DEFAULT_TIMEFRAMES } from "@/components/dashboard/TimeframeSelector";
import { getDefaultParams } from "@/components/dashboard/IndicatorParams";

const STORAGE_KEY = "dashboard_table_data";

// Generate random signal
const getRandomSignal = (): SignalType => {
  const signals: SignalType[] = ["buy", "sell", "neutral"];
  return signals[Math.floor(Math.random() * signals.length)];
};

const generateTimeframeSignals = (timeframes: string[] = DEFAULT_TIMEFRAMES): TimeframeSignal[] => {
  return timeframes.map((tf) => ({ timeframe: tf, signal: getRandomSignal() }));
};

const generateAccuracyHistory = (): AccuracyResult[] => {
  const results: AccuracyResult[] = [];
  for (let i = 0; i < 10; i++) {
    results.push({
      profit: Math.random() > 0.4 ? Math.random() * 5 : -Math.random() * 3,
      signal: Math.random() > 0.5 ? "buy" : "sell",
    });
  }
  return results;
};

// Initial mock data - minimum 1 per category (US Stocks, Crypto, Forex)
const initialData: SignalRowData[] = [
  // US Stocks
  {
    id: "1",
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "us_stocks",
    indicator: "RSI",
    indicatorParams: getDefaultParams("RSI"),
    timeframes: generateTimeframeSignals(),
    lastPrice: 195.89,
    change: 2.45,
    changePercent: 1.27,
    accuracyHistory: generateAccuracyHistory(),
  },
  // Crypto
  {
    id: "2",
    symbol: "BTC/USD",
    name: "Bitcoin",
    category: "crypto",
    indicator: "MACD",
    indicatorParams: getDefaultParams("MACD"),
    timeframes: generateTimeframeSignals(),
    lastPrice: 43256.00,
    change: -892.00,
    changePercent: -2.02,
    accuracyHistory: generateAccuracyHistory(),
  },
  // Forex
  {
    id: "3",
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    category: "forex",
    indicator: "Bollinger",
    indicatorParams: getDefaultParams("Bollinger"),
    timeframes: generateTimeframeSignals(),
    lastPrice: 1.0892,
    change: 0.0023,
    changePercent: 0.21,
    accuracyHistory: generateAccuracyHistory(),
  },
];

// Load data from localStorage or use initial data
const loadStoredData = (): SignalRowData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load stored data:", e);
  }
  return initialData;
};

const DashboardPage = () => {
  const [tableData, setTableData] = useState<SignalRowData[]>(() => loadStoredData());

  // Persist to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tableData));
    } catch (e) {
      console.error("Failed to save data:", e);
    }
  }, [tableData]);

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
