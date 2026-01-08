import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignalBadge, SignalType } from "./SignalBadge";
import { InstrumentSearch, Instrument } from "./InstrumentSearch";
import { TimeframeSelector, DEFAULT_TIMEFRAMES } from "./TimeframeSelector";
import { IndicatorParams, IndicatorParamsData, getDefaultParams } from "./IndicatorParams";
import { TradeButton } from "./TradeButton";
import { Activity, Clock, Layers, Plus, Trash2, TrendingUp, Target, Download, FlaskConical, LineChart, Search, X, Copy, FileDown, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BacktestTemplate, getTemplates } from "@/lib/templateService";

export interface TimeframeSignal {
  timeframe: string;
  signal: SignalType;
  selected?: boolean;
}

export interface AccuracyResult {
  profit: number;
  signal: "buy" | "sell";
}

export interface SignalRowData {
  id: string;
  symbol: string;
  name: string;
  category: string;
  indicator: string;
  indicatorParams: IndicatorParamsData;
  timeframes: TimeframeSignal[];
  lastPrice: number;
  change: number;
  changePercent: number;
  accuracyHistory: AccuracyResult[];
  useProbabilityMode?: boolean;
  loadedTemplateTimeframes?: string[]; // Track which timeframes came from template
}

interface SignalsTableProps {
  data: SignalRowData[];
  onDataChange: (data: SignalRowData[]) => void;
  instruments: Instrument[];
}

const INDICATORS = ["RSI", "MACD", "EMA", "Bollinger", "Stochastic", "SMA", "ADX", "ATR", "CCI", "Williams %R"];

const CATEGORY_LABELS: Record<string, string> = {
  us_stocks: "US Stocks",
  crypto: "Cryptocurrency",
  forex: "Forex / Currency",
};

const CATEGORY_ORDER = ["us_stocks", "crypto", "forex"];

const getRandomSignal = (): SignalType => {
  const signals: SignalType[] = ["buy", "sell", "neutral"];
  return signals[Math.floor(Math.random() * signals.length)];
};

const calculateProbability = (timeframes: TimeframeSignal[]): { signal: "buy" | "sell" | "neutral"; strength: number } => {
  let buyCount = 0;
  let sellCount = 0;
  
  timeframes.forEach((tf) => {
    if (tf.signal === "buy") buyCount++;
    else if (tf.signal === "sell") sellCount++;
  });
  
  const total = timeframes.length;
  const buyStrength = (buyCount / total) * 100;
  const sellStrength = (sellCount / total) * 100;
  
  if (buyStrength > sellStrength && buyStrength >= 40) {
    return { signal: "buy", strength: Math.round(buyStrength) };
  } else if (sellStrength > buyStrength && sellStrength >= 40) {
    return { signal: "sell", strength: Math.round(sellStrength) };
  }
  return { signal: "neutral", strength: Math.round(Math.max(buyStrength, sellStrength)) };
};

const calculateSelectedSignal = (timeframes: TimeframeSignal[]): { signal: SignalType; selectedTimeframes: string[] } => {
  const selected = timeframes.filter(tf => tf.selected);
  if (selected.length === 0) {
    return { signal: "neutral", selectedTimeframes: [] };
  }
  
  let buyCount = 0;
  let sellCount = 0;
  
  selected.forEach((tf) => {
    if (tf.signal === "buy") buyCount++;
    else if (tf.signal === "sell") sellCount++;
  });
  
  const signal = buyCount > sellCount ? "buy" : sellCount > buyCount ? "sell" : "neutral";
  return { signal, selectedTimeframes: selected.map(tf => tf.timeframe) };
};

const calculateAccuracy = (history: AccuracyResult[]): number => {
  if (history.length === 0) return 0;
  const profitableCount = history.filter((h) => h.profit > 0).length;
  return Math.round((profitableCount / history.length) * 100);
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

// Generate mock OHLCV CSV data
const generateOHLCVData = (symbol: string, timeframe: string): string => {
  const now = new Date();
  const rows = [];
  rows.push("timestamp,open,high,low,close,volume");
  
  let basePrice = Math.random() * 1000 + 100;
  for (let i = 50; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000).toISOString();
    const open = basePrice;
    const change = (Math.random() - 0.5) * 10;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    const volume = Math.floor(Math.random() * 100000) + 10000;
    
    rows.push(`${timestamp},${open.toFixed(2)},${high.toFixed(2)},${low.toFixed(2)},${close.toFixed(2)},${volume}`);
    basePrice = close;
  }
  
  return rows.join("\n");
};

const downloadCSV = (symbol: string, timeframe: string) => {
  const csvData = generateOHLCVData(symbol, timeframe);
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${symbol}_${timeframe}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  toast({
    title: "CSV Downloaded",
    description: `OHLCV data for ${symbol} (${timeframe}) downloaded successfully.`,
  });
};

export const SignalsTable = ({ data, onDataChange, instruments }: SignalsTableProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState<BacktestTemplate[]>(getTemplates());
  const [showIndicators, setShowIndicators] = useState(true);
  const [showTemplates, setShowTemplates] = useState(true);

  // Listen for template updates
  useEffect(() => {
    const handleTemplatesUpdate = (e: CustomEvent<BacktestTemplate[]>) => {
      setTemplates(e.detail);
    };
    
    window.addEventListener("templatesUpdated", handleTemplatesUpdate as EventListener);
    return () => {
      window.removeEventListener("templatesUpdated", handleTemplatesUpdate as EventListener);
    };
  }, []);
  
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
    return timeframes.map((tf) => ({ timeframe: tf, signal: getRandomSignal(), selected: false }));
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
      indicatorParams: getDefaultParams(selectedIndicator),
      timeframes: generateTimeframeSignals(),
      lastPrice: selectedInstrument.price,
      change: selectedInstrument.change,
      changePercent: selectedInstrument.changePercent,
      accuracyHistory: generateAccuracyHistory(),
      useProbabilityMode: false,
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
      indicatorParams: getDefaultParams(indicator),
      timeframes: generateTimeframeSignals(currentRow.timeframes.map((t) => t.timeframe)),
      loadedTemplateTimeframes: undefined, // Clear template highlighting when changing indicator
    };
    onDataChange(updatedData);
  };

  // Apply a template to an existing row
  const applyTemplateToRow = (id: string, template: BacktestTemplate) => {
    const rowIndex = data.findIndex((r) => r.id === id);
    if (rowIndex === -1) return;

    const currentRow = data[rowIndex];
    
    // Build the new timeframes array using the first timeframe from template as the first column
    const newTimeframes: TimeframeSignal[] = [];
    const templateTfSet = new Set(template.timeframes);
    
    // First add the template's first timeframe to the first column
    if (template.timeframes.length > 0) {
      newTimeframes.push({
        timeframe: template.timeframes[0],
        signal: getRandomSignal(),
        selected: false,
      });
    }
    
    // Then fill remaining columns with other template timeframes or existing ones
    const usedTimeframes = new Set([template.timeframes[0]]);
    for (let i = 1; i < 5; i++) {
      if (template.timeframes[i] && !usedTimeframes.has(template.timeframes[i])) {
        newTimeframes.push({
          timeframe: template.timeframes[i],
          signal: getRandomSignal(),
          selected: false,
        });
        usedTimeframes.add(template.timeframes[i]);
      } else {
        // Use existing timeframe if not in template
        const existingTf = currentRow.timeframes[i]?.timeframe || DEFAULT_TIMEFRAMES[i];
        if (!usedTimeframes.has(existingTf)) {
          newTimeframes.push({
            timeframe: existingTf,
            signal: getRandomSignal(),
            selected: false,
          });
          usedTimeframes.add(existingTf);
        } else {
          // Find a timeframe not yet used
          const availableTf = DEFAULT_TIMEFRAMES.find(tf => !usedTimeframes.has(tf)) || "1m";
          newTimeframes.push({
            timeframe: availableTf,
            signal: getRandomSignal(),
            selected: false,
          });
          usedTimeframes.add(availableTf);
        }
      }
    }

    const updatedData = [...data];
    updatedData[rowIndex] = {
      ...currentRow,
      indicator: template.indicator,
      indicatorParams: template.indicatorParams,
      timeframes: newTimeframes,
      loadedTemplateTimeframes: template.timeframes, // Track which timeframes came from template
    };
    onDataChange(updatedData);

    toast({
      title: "Template Applied",
      description: `"${template.name}" loaded with ${template.indicator} indicator.`,
    });
  };

  const updateIndicatorParams = (id: string, params: IndicatorParamsData) => {
    const rowIndex = data.findIndex((r) => r.id === id);
    if (rowIndex === -1) return;

    const updatedData = [...data];
    updatedData[rowIndex] = { ...data[rowIndex], indicatorParams: params };
    onDataChange(updatedData);
  };

  const updateTimeframe = (id: string, tfIndex: number, newTimeframe: string) => {
    const rowIndex = data.findIndex((r) => r.id === id);
    if (rowIndex === -1) return;

    const currentRow = data[rowIndex];
    const updatedTimeframes = [...currentRow.timeframes];
    updatedTimeframes[tfIndex] = { ...updatedTimeframes[tfIndex], timeframe: newTimeframe, signal: getRandomSignal() };

    const updatedData = [...data];
    updatedData[rowIndex] = { ...currentRow, timeframes: updatedTimeframes };
    onDataChange(updatedData);
  };

  const toggleTimeframeSelection = (id: string, tfIndex: number) => {
    const rowIndex = data.findIndex((r) => r.id === id);
    if (rowIndex === -1) return;

    const currentRow = data[rowIndex];
    if (currentRow.useProbabilityMode) return; // Don't allow timeframe selection in probability mode

    const updatedTimeframes = [...currentRow.timeframes];
    updatedTimeframes[tfIndex] = { ...updatedTimeframes[tfIndex], selected: !updatedTimeframes[tfIndex].selected };

    const updatedData = [...data];
    updatedData[rowIndex] = { ...currentRow, timeframes: updatedTimeframes };
    onDataChange(updatedData);
  };

  const toggleProbabilityMode = (id: string) => {
    const rowIndex = data.findIndex((r) => r.id === id);
    if (rowIndex === -1) return;

    const currentRow = data[rowIndex];
    const newMode = !currentRow.useProbabilityMode;
    
    // Clear timeframe selections when switching to probability mode
    const updatedTimeframes = currentRow.timeframes.map(tf => ({
      ...tf,
      selected: newMode ? false : tf.selected
    }));

    const updatedData = [...data];
    updatedData[rowIndex] = { ...currentRow, useProbabilityMode: newMode, timeframes: updatedTimeframes };
    onDataChange(updatedData);
  };

  // Load template into a new row
  const loadTemplateAsRow = (template: BacktestTemplate) => {
    // Find the instrument
    const instrument = instruments.find(i => i.symbol === template.symbol);
    if (!instrument) {
      toast({
        title: "Instrument Not Found",
        description: `${template.symbol} is not available in the instrument list.`,
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates
    if (isDuplicate(template.symbol, template.indicator)) {
      toast({
        title: "Duplicate Entry",
        description: `${template.symbol} + ${template.indicator} combination already exists.`,
        variant: "destructive",
      });
      return;
    }

    const newRow: SignalRowData = {
      id: Date.now().toString(),
      symbol: template.symbol,
      name: template.symbolName,
      category: instrument.category,
      indicator: template.indicator,
      indicatorParams: template.indicatorParams,
      timeframes: template.timeframes.map((tf) => ({ 
        timeframe: tf, 
        signal: getRandomSignal(), 
        selected: false 
      })),
      lastPrice: instrument.price,
      change: instrument.change,
      changePercent: instrument.changePercent,
      accuracyHistory: generateAccuracyHistory(),
      useProbabilityMode: false,
    };

    onDataChange([...data, newRow]);
  };

  // Filter data based on search query
  const filteredData = searchQuery.trim()
    ? data.filter((row) =>
        row.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data;

  // Group data by category
  const groupedData = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = filteredData.filter((row) => row.category === category);
    return acc;
  }, {} as Record<string, SignalRowData[]>);

  let globalIndex = 0;

  return (
    <TooltipProvider>
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ticker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] pl-9 pr-8 h-9 bg-secondary/50 border-border/50"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-secondary"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div>
              <h2 className="font-semibold text-foreground">Trading Signals</h2>
              <p className="text-xs text-muted-foreground">
                {searchQuery ? `Showing ${filteredData.length} of ${data.length} entries` : "Multi-timeframe indicator analysis"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => navigate("/copy-trading")}
            >
              <Copy className="h-4 w-4" />
              Copy Trading
            </Button>
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
                <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-8">
                  #
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[180px]">
                  Instrument
                </th>
                <th className="text-center px-2 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                  Chart
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[110px]">
                  Indicator
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[100px]">
                  Parameters
                </th>
                {[0, 1, 2, 3, 4].map((i) => (
                  <th key={i} className="text-center px-2 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[100px]">
                    TF {i + 1}
                  </th>
                ))}
                <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[90px]">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Prob.
                  </div>
                </th>
                <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[80px]">
                  <div className="flex items-center justify-center gap-1">
                    <Target className="h-3 w-3" />
                    Acc.
                  </div>
                </th>
                <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[80px]">
                  Trade
                </th>
                <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_ORDER.map((category) => {
                const categoryRows = groupedData[category];
                if (categoryRows.length === 0) return null;

                return (
                  <React.Fragment key={category}>
                    {/* Category Header */}
                    <tr className="bg-secondary/40">
                      <td colSpan={14} className="px-4 py-2">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                          {CATEGORY_LABELS[category]}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({categoryRows.length} {categoryRows.length === 1 ? "entry" : "entries"})
                        </span>
                      </td>
                    </tr>
                    {/* Category Rows */}
                    {categoryRows.map((row) => {
                      globalIndex++;
                      const probability = calculateProbability(row.timeframes);
                      const accuracy = calculateAccuracy(row.accuracyHistory);
                      const selectedInfo = calculateSelectedSignal(row.timeframes);
                      const useProbabilityMode = row.useProbabilityMode ?? false;
                      
                      return (
                        <tr
                          key={row.id}
                          className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="px-3 py-3 text-sm text-muted-foreground font-mono">
                            {globalIndex}
                          </td>
                          <td className="px-3 py-3">
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
                          <td className="px-2 py-3 text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate("/chart", {
                                    state: {
                                      symbol: row.symbol,
                                      name: row.name,
                                    }
                                  })}
                                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                  <LineChart className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View {row.symbol} Chart</p>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="px-3 py-3">
                            <Select
                              value={row.indicator}
                              onValueChange={(value) => {
                                // Check if it's a template
                                if (value.startsWith("template_")) {
                                  const templateId = value;
                                  const template = templates.find(t => t.id === templateId);
                                  if (template) {
                                    applyTemplateToRow(row.id, template);
                                  }
                                } else {
                                  updateIndicator(row.id, value);
                                }
                              }}
                            >
                              <SelectTrigger className="w-[120px] bg-secondary/50 border-border/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border z-50 max-h-[350px]">
                                {/* Indicators Section */}
                                <div 
                                  className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-secondary/50 rounded-sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowIndicators(!showIndicators);
                                  }}
                                >
                                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Indicators</span>
                                  {showIndicators ? (
                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                                {showIndicators && (
                                  <SelectGroup>
                                    {INDICATORS.map((ind) => (
                                      <SelectItem key={ind} value={ind}>
                                        {ind}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                )}
                                
                                {/* Templates Section */}
                                {templates.length > 0 && (
                                  <>
                                    <Separator className="my-1" />
                                    <div 
                                      className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-secondary/50 rounded-sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowTemplates(!showTemplates);
                                      }}
                                    >
                                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <FileDown className="h-3 w-3" />
                                        Templates
                                      </span>
                                      {showTemplates ? (
                                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                      )}
                                    </div>
                                    {showTemplates && (
                                      <SelectGroup>
                                        {templates.map((template) => (
                                          <SelectItem 
                                            key={template.id} 
                                            value={template.id}
                                            className="text-xs"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">{template.name}</span>
                                              <span className="text-muted-foreground text-[10px]">
                                                ({template.indicator})
                                              </span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                    )}
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-3 py-3">
                            <IndicatorParams
                              indicator={row.indicator}
                              params={row.indicatorParams}
                              onChange={(params) => updateIndicatorParams(row.id, params)}
                            />
                          </td>
                          {row.timeframes.map((tf, tfIndex) => {
                            const isTemplateTimeframe = row.loadedTemplateTimeframes?.includes(tf.timeframe);
                            return (
                            <td key={tfIndex} className={cn(
                              "px-2 py-3 text-center",
                              isTemplateTimeframe && "bg-primary/10 border-x border-primary/20"
                            )}>
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className={cn(
                                        "flex items-center justify-center h-5 w-5",
                                        useProbabilityMode && "opacity-40 cursor-not-allowed"
                                      )}>
                                        <Checkbox
                                          checked={tf.selected ?? false}
                                          onCheckedChange={() => toggleTimeframeSelection(row.id, tfIndex)}
                                          disabled={useProbabilityMode}
                                          className="h-4 w-4 border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{useProbabilityMode ? "Disable probability mode to select timeframes" : "Select for trading"}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <TimeframeSelector
                                    value={tf.timeframe}
                                    onChange={(newTf) => updateTimeframe(row.id, tfIndex, newTf)}
                                    excludeTimeframes={row.timeframes.filter((_, i) => i !== tfIndex).map((t) => t.timeframe)}
                                  />
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => downloadCSV(row.symbol, tf.timeframe)}
                                        className="h-5 w-5 rounded-full bg-primary/20 hover:bg-primary/40 flex items-center justify-center transition-colors"
                                      >
                                        <Download className="h-3 w-3 text-primary" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Download {tf.timeframe} OHLCV CSV</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <SignalBadge signal={tf.signal} showIcon={false} className="text-[10px] px-2 py-0.5" />
                              </div>
                            </td>
                          );
                          })}
                          <td className="px-3 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center justify-center h-5 w-5">
                                      <Checkbox
                                        checked={useProbabilityMode}
                                        onCheckedChange={() => toggleProbabilityMode(row.id)}
                                        className="h-4 w-4 border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Use probability-based trading</p>
                                  </TooltipContent>
                                </Tooltip>
                                <SignalBadge 
                                  signal={probability.signal} 
                                  showIcon 
                                  className="text-xs px-2 py-1"
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {probability.strength}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                              accuracy >= 70 ? "bg-buy/20 text-buy" :
                              accuracy >= 50 ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-sell/20 text-sell"
                            )}>
                              <Target className="h-3 w-3" />
                              {accuracy}%
                            </div>
                            <div className="text-[9px] text-muted-foreground mt-0.5">
                              Last {row.accuracyHistory.length}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <TradeButton
                              symbol={row.symbol}
                              signal={useProbabilityMode ? probability.signal : selectedInfo.signal}
                              probability={probability.strength}
                              selectedTimeframes={selectedInfo.selectedTimeframes}
                              useProbabilityMode={useProbabilityMode}
                            />
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate("/backtest", {
                                      state: {
                                        symbol: row.symbol,
                                        name: row.name,
                                        indicator: row.indicator,
                                        indicatorParams: row.indicatorParams,
                                        timeframes: row.timeframes.map(t => t.timeframe),
                                      }
                                    })}
                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  >
                                    <FlaskConical className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Backtest {row.symbol}</p>
                                </TooltipContent>
                              </Tooltip>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteRow(row.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-sell hover:bg-sell/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center text-muted-foreground">
                    No entries yet. Click "Add Row" to create your first signal configuration.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
};
