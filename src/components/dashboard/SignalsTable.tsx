import { useState } from "react";
import { SignalBadge, SignalType } from "./SignalBadge";
import { Activity, Clock, Layers, Plus, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export interface SignalRowData {
  id: string;
  symbol: string;
  name: string;
  indicator: string;
  timeframe: string;
  signal: SignalType;
  lastPrice: number;
  change: number;
  changePercent: number;
}

interface SignalsTableProps {
  data: SignalRowData[];
  onDataChange: (data: SignalRowData[]) => void;
  availableSymbols: { symbol: string; name: string; price: number; change: number; changePercent: number }[];
}

const INDICATORS = ["RSI", "MACD", "EMA", "Bollinger", "Stochastic", "SMA", "ADX", "ATR", "CCI", "Williams %R"];
const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"];

export const SignalsTable = ({ data, onDataChange, availableSymbols }: SignalsTableProps) => {
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

  const isDuplicate = (symbol: string, indicator: string, excludeId?: string) => {
    return data.some(
      (row) => row.symbol === symbol && row.indicator === indicator && row.id !== excludeId
    );
  };

  const addRow = () => {
    const defaultSymbol = availableSymbols[0];
    const defaultIndicator = INDICATORS[0];
    const defaultTimeframe = TIMEFRAMES[0];

    // Find a non-duplicate combination
    let selectedSymbol = defaultSymbol;
    let selectedIndicator = defaultIndicator;

    for (const sym of availableSymbols) {
      for (const ind of INDICATORS) {
        if (!isDuplicate(sym.symbol, ind)) {
          selectedSymbol = sym;
          selectedIndicator = ind;
          break;
        }
      }
      if (!isDuplicate(selectedSymbol.symbol, selectedIndicator)) break;
    }

    if (isDuplicate(selectedSymbol.symbol, selectedIndicator)) {
      toast({
        title: "Cannot add row",
        description: "All symbol + indicator combinations are already in use.",
        variant: "destructive",
      });
      return;
    }

    const signals: SignalType[] = ["buy", "sell", "neutral"];
    const newRow: SignalRowData = {
      id: Date.now().toString(),
      symbol: selectedSymbol.symbol,
      name: selectedSymbol.name,
      indicator: selectedIndicator,
      timeframe: defaultTimeframe,
      signal: signals[Math.floor(Math.random() * signals.length)],
      lastPrice: selectedSymbol.price,
      change: selectedSymbol.change,
      changePercent: selectedSymbol.changePercent,
    };

    onDataChange([...data, newRow]);
  };

  const deleteRow = (id: string) => {
    onDataChange(data.filter((row) => row.id !== id));
  };

  const updateRow = (id: string, field: keyof SignalRowData, value: string) => {
    const rowIndex = data.findIndex((r) => r.id === id);
    if (rowIndex === -1) return;

    const currentRow = data[rowIndex];
    let newSymbol = currentRow.symbol;
    let newIndicator = currentRow.indicator;

    if (field === "symbol") {
      newSymbol = value;
      const symbolData = availableSymbols.find((s) => s.symbol === value);
      if (symbolData && isDuplicate(value, currentRow.indicator, id)) {
        toast({
          title: "Duplicate Entry",
          description: `${value} + ${currentRow.indicator} combination already exists.`,
          variant: "destructive",
        });
        return;
      }
    } else if (field === "indicator") {
      newIndicator = value;
      if (isDuplicate(currentRow.symbol, value, id)) {
        toast({
          title: "Duplicate Entry",
          description: `${currentRow.symbol} + ${value} combination already exists.`,
          variant: "destructive",
        });
        return;
      }
    }

    const updatedData = [...data];
    if (field === "symbol") {
      const symbolData = availableSymbols.find((s) => s.symbol === value);
      if (symbolData) {
        updatedData[rowIndex] = {
          ...currentRow,
          symbol: value,
          name: symbolData.name,
          lastPrice: symbolData.price,
          change: symbolData.change,
          changePercent: symbolData.changePercent,
        };
      }
    } else if (field === "timeframe") {
      // Re-generate signal when timeframe changes (simulating new data)
      const signals: SignalType[] = ["buy", "sell", "neutral"];
      updatedData[rowIndex] = {
        ...currentRow,
        timeframe: value,
        signal: signals[Math.floor(Math.random() * signals.length)],
      };
    } else {
      updatedData[rowIndex] = { ...currentRow, [field]: value };
    }

    onDataChange(updatedData);
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
            <p className="text-xs text-muted-foreground">Configurable indicator analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Updated: Just now</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>{data.length} Entries</span>
          </div>
          <Button onClick={addRow} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Row
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                #
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Instrument
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Price
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Indicator
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Timeframe
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Signal
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.id}
                className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                  {index + 1}
                </td>
                <td className="px-4 py-4">
                  <Select
                    value={row.symbol}
                    onValueChange={(value) => updateRow(row.id, "symbol", value)}
                  >
                    <SelectTrigger className="w-[180px] bg-secondary/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border z-50">
                      {availableSymbols.map((sym) => (
                        <SelectItem key={sym.symbol} value={sym.symbol}>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{sym.symbol}</span>
                            <span className="text-xs text-muted-foreground">{sym.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="font-mono font-semibold text-foreground">${formatPrice(row.lastPrice)}</div>
                  {formatChange(row.change, row.changePercent)}
                </td>
                <td className="px-4 py-4">
                  <Select
                    value={row.indicator}
                    onValueChange={(value) => updateRow(row.id, "indicator", value)}
                  >
                    <SelectTrigger className="w-[140px] bg-secondary/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border z-50">
                      {INDICATORS.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-4">
                  <Select
                    value={row.timeframe}
                    onValueChange={(value) => updateRow(row.id, "timeframe", value)}
                  >
                    <SelectTrigger className="w-[100px] bg-secondary/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border z-50">
                      {TIMEFRAMES.map((tf) => (
                        <SelectItem key={tf} value={tf}>
                          {tf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-4 text-center">
                  <SignalBadge signal={row.signal} />
                </td>
                <td className="px-4 py-4 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRow(row.id)}
                    className="text-muted-foreground hover:text-sell hover:bg-sell/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No entries yet. Click "Add Row" to create your first signal configuration.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
