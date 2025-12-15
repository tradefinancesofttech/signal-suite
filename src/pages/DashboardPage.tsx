import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SignalsTable } from "@/components/dashboard/SignalsTable";
import { StatsCard, SignalsSummary } from "@/components/dashboard/StatsCard";
import { Activity, TrendingUp, Clock, Zap } from "lucide-react";
import { SignalType } from "@/components/dashboard/SignalBadge";

// Mock data generator
const generateSignals = (): { timeframe: string; signal: SignalType }[] => {
  const timeframes = ["1m", "5m", "15m", "1h", "4h", "1d"];
  const signals: SignalType[] = ["buy", "sell", "neutral"];
  return timeframes.map(tf => ({
    timeframe: tf,
    signal: signals[Math.floor(Math.random() * signals.length)]
  }));
};

const mockData = [
  {
    id: "1",
    symbol: "EURUSD",
    name: "Euro / US Dollar",
    lastPrice: 1.0892,
    change: 0.0023,
    changePercent: 0.21,
    indicators: {
      rsi: generateSignals(),
      macd: generateSignals(),
      ema: generateSignals(),
      bollinger: generateSignals(),
      stochastic: generateSignals(),
    },
  },
  {
    id: "2",
    symbol: "GBPUSD",
    name: "British Pound / US Dollar",
    lastPrice: 1.2654,
    change: -0.0045,
    changePercent: -0.35,
    indicators: {
      rsi: generateSignals(),
      macd: generateSignals(),
      ema: generateSignals(),
      bollinger: generateSignals(),
      stochastic: generateSignals(),
    },
  },
  {
    id: "3",
    symbol: "USDJPY",
    name: "US Dollar / Japanese Yen",
    lastPrice: 149.82,
    change: 0.56,
    changePercent: 0.38,
    indicators: {
      rsi: generateSignals(),
      macd: generateSignals(),
      ema: generateSignals(),
      bollinger: generateSignals(),
      stochastic: generateSignals(),
    },
  },
  {
    id: "4",
    symbol: "XAUUSD",
    name: "Gold / US Dollar",
    lastPrice: 2024.50,
    change: 12.30,
    changePercent: 0.61,
    indicators: {
      rsi: generateSignals(),
      macd: generateSignals(),
      ema: generateSignals(),
      bollinger: generateSignals(),
      stochastic: generateSignals(),
    },
  },
  {
    id: "5",
    symbol: "BTCUSD",
    name: "Bitcoin / US Dollar",
    lastPrice: 43256.00,
    change: -892.00,
    changePercent: -2.02,
    indicators: {
      rsi: generateSignals(),
      macd: generateSignals(),
      ema: generateSignals(),
      bollinger: generateSignals(),
      stochastic: generateSignals(),
    },
  },
  {
    id: "6",
    symbol: "ETHUSD",
    name: "Ethereum / US Dollar",
    lastPrice: 2285.40,
    change: 45.20,
    changePercent: 2.02,
    indicators: {
      rsi: generateSignals(),
      macd: generateSignals(),
      ema: generateSignals(),
      bollinger: generateSignals(),
      stochastic: generateSignals(),
    },
  },
];

// Calculate signal counts
const countSignals = () => {
  let buy = 0, sell = 0, neutral = 0;
  mockData.forEach(row => {
    Object.values(row.indicators).forEach(indicator => {
      indicator.forEach(s => {
        if (s.signal === "buy") buy++;
        else if (s.signal === "sell") sell++;
        else neutral++;
      });
    });
  });
  return { buy, sell, neutral };
};

const DashboardPage = () => {
  const signalCounts = countSignals();

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
            title="Active Instruments"
            value={mockData.length}
            subtitle="Forex & Crypto"
            icon={<Activity className="h-5 w-5" />}
          />
          <StatsCard
            title="Strong Buy Signals"
            value={signalCounts.buy}
            subtitle="Across all timeframes"
            trend="up"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatsCard
            title="Indicators Active"
            value={5}
            subtitle="RSI, MACD, EMA, BB, Stoch"
            icon={<Zap className="h-5 w-5" />}
          />
          <SignalsSummary
            buyCount={signalCounts.buy}
            sellCount={signalCounts.sell}
            neutralCount={signalCounts.neutral}
          />
        </div>

        {/* Signals Table */}
        <SignalsTable data={mockData} />
      </main>
    </div>
  );
};

export default DashboardPage;
