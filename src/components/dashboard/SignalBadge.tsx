import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type SignalType = "buy" | "sell" | "neutral";

interface SignalBadgeProps {
  signal: SignalType;
  showIcon?: boolean;
  className?: string;
}

export const SignalBadge = ({ signal, showIcon = true, className }: SignalBadgeProps) => {
  const config = {
    buy: {
      label: "BUY",
      icon: TrendingUp,
      className: "signal-buy",
    },
    sell: {
      label: "SELL",
      icon: TrendingDown,
      className: "signal-sell",
    },
    neutral: {
      label: "HOLD",
      icon: Minus,
      className: "signal-neutral",
    },
  };

  const { label, icon: Icon, className: signalClass } = config[signal];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-mono",
        signalClass,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </div>
  );
};
