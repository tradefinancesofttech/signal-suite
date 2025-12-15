import { useState } from "react";
import { SignalBadge, SignalType } from "./SignalBadge";
import { InstrumentSearch, Instrument } from "./InstrumentSearch";
import { TimeframeSelector, DEFAULT_TIMEFRAMES } from "./TimeframeSelector";
import { Activity, Clock, Layers, Plus, Trash2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export interface TimeframeSignal {
  timeframe: string;
  signal: SignalType;
}

export interface SignalRowData {
  id: string;
  symbol: string;
  name: string;
  category: string;
  indicator: string;
  timeframes: TimeframeSignal[];
  lastPrice: number;
  change: number;
  changePercent: number;
}

interface SignalsTableProps {
  data: SignalRowData[];
  onDataChange: (data: SignalRowData[]) => void;
  instruments: Instrument[];
}

const INDICATORS = ["RSI", "MACD", "EMA", "Bollinger", "Stochastic", "SMA", "ADX", "ATR", "CCI", "Williams %R"];

const getRandomSignal = (): SignalType => {
  const signals: SignalType[] = ["buy", "sell", "neutral"];
  return signals[Math.floor(Math.random() * signals.length)];
};

export const SignalsTable = ({ data, onDataChange, instruments }: SignalsTableProps) => {
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const formatChange = (change: number, percent: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`font-mono text-xs ${isPositive ? "text-buy" : "text-sell"}`}>
        <span>{isPositive ? "+" : ""}{percent.toFixed(2)}%</span>
      </div>
    );
  };

  const isDuplicate = (symbol: string, indicator: string, excludeId?: string) => {
    return data.some(
      (row) => row.symbol === symbol && row.indicator === indicator && row.id !== excludeId
    );
  };

  const generateTimeframeSignals = (timeframes: string[] = DEFAULT_TIMEFRAMES): TimeframeSignal[] => {
    return timeframes.map((tf) => ({ timeframe: tf, signal: getRandomSignal() }));
  };

  const addRow = () => {
    const defaultInstrument = instruments[0];
    const defaultIndicator = INDICATORS[0];

    let selectedInstrument = defaultInstrument;
    let selectedIndicator = defaultIndicator;

    for (const inst of instruments) {
      for (const ind of INDICATORS) {
        if (!isDuplicate(inst.symbol, ind)) {
          selectedInstrument = inst;
          selectedIndicator = ind;
          break;
        }
      }
      if (!isDuplicate(selectedInstrument.symbol, selectedIndicator)) break;
    }

    if (isDuplicate(selectedInstrument.symbol, selectedIndicator)) {
      toast({
        title: "Cannot add row",
        description: "All symbol + indicator combinations are already in use.",
        variant: "destructive",
      });
      return;
    }

    const newRow: SignalRowData = {
      id: Date.now().toString(),
      symbol: selectedInstrument.symbol,
      name: selectedInstrument.name,
      category: selectedInstrument.category,
      indicator: selectedIndicator,
      timeframes: generateTimeframeSignals(),
      lastPrice: selectedInstrument.price,
      change: selectedInstrument.change,
      changePercent: selectedInstrument.changePercent,
    };

    onDataChange([...data, newRow]);
  };

  const deleteRow = (id: string) => {
    onDataChange(data.filter((row) => row.id !== id));
  };

  const updateInstrument = (id: string, instrument: Instrument) => {
    const rowIndex = data.findIndex((r) => r.id === id);
    if (rowIndex === -1) return;

    const currentRow = data[rowIndex];
    if (isDuplicate(instrument.symbol, currentRow.indicator, id)) {
      toast({
        title: "Duplicate Entry",
        description: `${instrument.symbol} + ${currentRow.indicator} combination already exists.`,
        variant: "destructive",
      });
      return;
    }

    const updatedData = [...data];
    updatedData[rowIndex] = {
      ...currentRow,
      symbol: instrument.symbol,
      name: instrument.name,
      category: instrument.category,
      lastPrice: instrument.price,
      change: instrument.change,
      changePercent: instrument.changePercent,
    };
    onDataChange(updatedData);
  };

  const updateIndicator = (id: string, indicator: string) => {
    const rowIndex = data.findIndex((r) => r.id === id);
    if (rowIndex === -1) return;

    const currentRow = data[rowIndex];
    if (isDuplicate(currentRow.symbol, indicator, id)) {
      toast({
        title: "Duplicate Entry",
        description: `${currentRow.symbol} + ${indicator} combination already exists.`,
        variant: "destructive",
      });
      return;
    }

    const updatedData = [...data];
    updatedData[rowIndex] = {
      ...currentRow,
      indicator,
      timeframes: generateTimeframeSignals(currentRow.timeframes.map((t) => t.timeframe)),
    };
    onDataChange(updatedData);
  };

  const updateTimeframe = (id: string, tfIndex: number, newTimeframe: string) => {
    const rowIndex = data.findIndex((r) => r.id === id);
    if (rowIndex === -1) return;

    const currentRow = data[rowIndex];
    const updatedTimeframes = [...currentRow.timeframes];
    updatedTimeframes[tfIndex] = { timeframe: newTimeframe, signal: getRandomSignal() };

    const updatedData = [...data];
    updatedData[rowIndex] = { ...currentRow, timeframes: updatedTimeframes };
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
            <p className="text-xs text-muted-foreground">Multi-timeframe indicator analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Live</span>
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
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-10">
                #
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[200px]">
                Instrument
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[130px]">
                Indicator
              </th>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <th key={i} className="text-center px-2 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[90px]">
                  TF {i + 1}
                </th>
              ))}
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">
                <Settings2 className="h-4 w-4 mx-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.id}
                className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <InstrumentSearch
                      value={row.symbol}
                      instruments={instruments}
                      onSelect={(instrument) => updateInstrument(row.id, instrument)}
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-foreground">${formatPrice(row.lastPrice)}</span>
                      {formatChange(row.change, row.changePercent)}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={row.indicator}
                    onValueChange={(value) => updateIndicator(row.id, value)}
                  >
                    <SelectTrigger className="w-[120px] bg-secondary/50 border-border/50">
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
                {row.timeframes.map((tf, tfIndex) => (
                  <td key={tfIndex} className="px-2 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <TimeframeSelector
                        value={tf.timeframe}
                        onChange={(newTf) => updateTimeframe(row.id, tfIndex, newTf)}
                        excludeTimeframes={row.timeframes.filter((_, i) => i !== tfIndex).map((t) => t.timeframe)}
                      />
                      <SignalBadge signal={tf.signal} showIcon={false} className="text-[10px] px-2 py-0.5" />
                    </div>
                  </td>
                ))}
                <td className="px-4 py-3 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRow(row.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-sell hover:bg-sell/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
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
