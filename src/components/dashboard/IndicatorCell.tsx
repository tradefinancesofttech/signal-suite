import { SignalBadge, SignalType } from "./SignalBadge";

interface TimeframeSignal {
  timeframe: string;
  signal: SignalType;
}

interface IndicatorCellProps {
  indicatorName: string;
  signals: TimeframeSignal[];
}

export const IndicatorCell = ({ indicatorName, signals }: IndicatorCellProps) => {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {indicatorName}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {signals.map((s) => (
          <div key={s.timeframe} className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-muted-foreground font-mono">{s.timeframe}</span>
            <SignalBadge signal={s.signal} showIcon={false} className="text-[10px] px-1.5 py-0.5" />
          </div>
        ))}
      </div>
    </div>
  );
};
