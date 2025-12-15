import { SignalType } from "./SignalBadge";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}

export const StatsCard = ({ title, value, subtitle, trend, icon }: StatsCardProps) => {
  const trendColor = trend === "up" ? "text-buy" : trend === "down" ? "text-sell" : "text-muted-foreground";

  return (
    <div className="glass-card p-5 rounded-xl">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-bold font-mono ${trendColor}`}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {icon && (
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

interface SignalsSummaryProps {
  buyCount: number;
  sellCount: number;
  neutralCount: number;
}

export const SignalsSummary = ({ buyCount, sellCount, neutralCount }: SignalsSummaryProps) => {
  const total = buyCount + sellCount + neutralCount;
  const buyPercent = total > 0 ? (buyCount / total) * 100 : 0;
  const sellPercent = total > 0 ? (sellCount / total) * 100 : 0;

  return (
    <div className="glass-card p-5 rounded-xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Signal Distribution</p>
          <p className="text-xs text-muted-foreground">{total} total</p>
        </div>
        
        {/* Bar */}
        <div className="h-3 rounded-full bg-secondary overflow-hidden flex">
          <div 
            className="h-full bg-buy transition-all duration-500" 
            style={{ width: `${buyPercent}%` }} 
          />
          <div 
            className="h-full bg-sell transition-all duration-500" 
            style={{ width: `${sellPercent}%` }} 
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-buy" />
            <span className="text-muted-foreground">Buy</span>
            <span className="font-mono font-semibold text-buy">{buyCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-sell" />
            <span className="text-muted-foreground">Sell</span>
            <span className="font-mono font-semibold text-sell">{sellCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-neutral" />
            <span className="text-muted-foreground">Hold</span>
            <span className="font-mono font-semibold text-neutral">{neutralCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
