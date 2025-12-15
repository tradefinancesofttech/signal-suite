import { SignalType } from "./SignalBadge";
import { IndicatorCell } from "./IndicatorCell";
import { Activity, Clock, Layers } from "lucide-react";

interface InstrumentIndicators {
  rsi: { timeframe: string; signal: SignalType }[];
  macd: { timeframe: string; signal: SignalType }[];
  ema: { timeframe: string; signal: SignalType }[];
  bollinger: { timeframe: string; signal: SignalType }[];
  stochastic: { timeframe: string; signal: SignalType }[];
}

interface InstrumentRowData {
  id: string;
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  indicators: InstrumentIndicators;
}

interface SignalsTableProps {
  data: InstrumentRowData[];
}

export const SignalsTable = ({ data }: SignalsTableProps) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatChange = (change: number, percent: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`font-mono text-sm ${isPositive ? "text-buy" : "text-sell"}`}>
        <span>{isPositive ? "+" : ""}{formatPrice(change)}</span>
        <span className="ml-1 text-xs">({isPositive ? "+" : ""}{percent.toFixed(2)}%)</span>
      </div>
    );
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Trading Signals</h2>
            <p className="text-xs text-muted-foreground">Real-time indicator analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Updated: Just now</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>{data.length} Instruments</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider sticky left-0 bg-card z-10">
                Instrument
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Price
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                RSI
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                MACD
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                EMA
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Bollinger
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Stochastic
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.id}
                className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4 sticky left-0 bg-card/80 backdrop-blur-sm z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center font-bold text-sm text-primary">
                      {row.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{row.symbol}</div>
                      <div className="text-xs text-muted-foreground">{row.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="font-mono font-semibold text-foreground">${formatPrice(row.lastPrice)}</div>
                  {formatChange(row.change, row.changePercent)}
                </td>
                <td className="px-4 py-4">
                  <IndicatorCell indicatorName="" signals={row.indicators.rsi} />
                </td>
                <td className="px-4 py-4">
                  <IndicatorCell indicatorName="" signals={row.indicators.macd} />
                </td>
                <td className="px-4 py-4">
                  <IndicatorCell indicatorName="" signals={row.indicators.ema} />
                </td>
                <td className="px-4 py-4">
                  <IndicatorCell indicatorName="" signals={row.indicators.bollinger} />
                </td>
                <td className="px-4 py-4">
                  <IndicatorCell indicatorName="" signals={row.indicators.stochastic} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
