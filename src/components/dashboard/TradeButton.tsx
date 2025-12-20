import { useState } from "react";
import { Play, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { loadAccountConfig, TradingAccountConfig } from "./TradingAccountSettings";
import { SignalType } from "./SignalBadge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TradeButtonProps {
  symbol: string;
  signal: SignalType;
  probability: number;
  selectedTimeframes: string[];
  useProbabilityMode: boolean;
}

export const TradeButton = ({
  symbol,
  signal,
  probability,
  selectedTimeframes,
  useProbabilityMode,
}: TradeButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const config = loadAccountConfig();

  const handleTrade = () => {
    const mode = useProbabilityMode ? "Probability" : "Timeframe";
    const details = useProbabilityMode
      ? `Signal: ${signal.toUpperCase()} (${probability}%)`
      : `Timeframes: ${selectedTimeframes.join(", ")}`;

    toast({
      title: `${config.accountType === "paper" ? "Paper" : "Live"} Trade Executed`,
      description: `${symbol} - ${mode} mode. ${details}`,
    });
    setShowConfirm(false);
  };

  const canTrade = signal !== "neutral" && (useProbabilityMode || selectedTimeframes.length > 0);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={!canTrade}
        className={cn(
          "h-7 px-2 text-xs gap-1",
          config.accountType === "paper"
            ? "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
            : "border-buy/50 text-buy hover:bg-buy/10"
        )}
      >
        <Play className="h-3 w-3" />
        {config.accountType === "paper" ? "Paper" : "Live"}
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {config.accountType === "live" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
              Confirm {config.accountType === "paper" ? "Paper" : "Live"} Trade
            </DialogTitle>
            <DialogDescription>
              You are about to place a trade on {symbol}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Symbol</span>
                <span className="font-mono font-medium">{symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mode</span>
                <span className={cn(
                  "font-medium",
                  useProbabilityMode ? "text-primary" : "text-foreground"
                )}>
                  {useProbabilityMode ? "Probability-Based" : "Timeframe-Based"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Signal</span>
                <span className={cn(
                  "font-medium uppercase",
                  signal === "buy" ? "text-buy" : signal === "sell" ? "text-sell" : "text-muted-foreground"
                )}>
                  {signal}
                </span>
              </div>
              {useProbabilityMode && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Probability</span>
                  <span className="font-medium">{probability}%</span>
                </div>
              )}
              {!useProbabilityMode && selectedTimeframes.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Timeframes</span>
                  <span className="font-mono text-xs">{selectedTimeframes.join(", ")}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account</span>
                <span className={cn(
                  "font-medium",
                  config.accountType === "paper" ? "text-yellow-500" : "text-buy"
                )}>
                  {config.accountType === "paper" ? `Paper ($${config.paperBalance.toLocaleString()})` : "Live"}
                </span>
              </div>
            </div>

            {config.accountType === "live" && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <p className="text-xs text-yellow-500">
                  This will place a real trade with actual funds. Make sure you understand the risks.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTrade}
              className={cn(
                signal === "buy" ? "bg-buy hover:bg-buy/80" : "bg-sell hover:bg-sell/80"
              )}
            >
              {signal === "buy" ? "Buy" : "Sell"} {symbol}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
