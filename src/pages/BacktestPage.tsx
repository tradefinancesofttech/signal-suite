import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft, Play, Download, TrendingUp, TrendingDown, Target, BarChart3, DollarSign, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from "recharts";

interface BacktestResult {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: TradeResult[];
  equityCurve: { date: string; equity: number }[];
}

interface TradeResult {
  id: number;
  entryDate: string;
  exitDate: string;
  type: "buy" | "sell";
  entryPrice: number;
  exitPrice: number;
  profit: number;
  profitPercent: number;
}

const TIMEFRAMES = ["1m", "3m", "5m", "10m", "15m", "30m", "1hr", "2h", "3h", "4h", "1d"];

const generateMockResults = (symbol: string, indicator: string, initialCapital: number): BacktestResult => {
  const trades: TradeResult[] = [];
  const numTrades = Math.floor(Math.random() * 50) + 20;
  let basePrice = Math.random() * 1000 + 100;
  let equity = initialCapital;
  const equityCurve: { date: string; equity: number }[] = [{ date: "Start", equity: initialCapital }];
  
  for (let i = 0; i < numTrades; i++) {
    const entryDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const exitDate = new Date(entryDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
    const type = Math.random() > 0.5 ? "buy" : "sell";
    const entryPrice = basePrice + (Math.random() - 0.5) * 20;
    const priceChange = (Math.random() - 0.4) * 10;
    const exitPrice = entryPrice + (type === "buy" ? priceChange : -priceChange);
    const profit = type === "buy" ? exitPrice - entryPrice : entryPrice - exitPrice;
    
    trades.push({
      id: i + 1,
      entryDate: format(entryDate, "yyyy-MM-dd HH:mm"),
      exitDate: format(exitDate, "yyyy-MM-dd HH:mm"),
      type,
      entryPrice: Number(entryPrice.toFixed(2)),
      exitPrice: Number(exitPrice.toFixed(2)),
      profit: Number(profit.toFixed(2)),
      profitPercent: Number(((profit / entryPrice) * 100).toFixed(2)),
    });
    
    equity += profit * 10; // Simplified position sizing
    equityCurve.push({ date: `Trade ${i + 1}`, equity: Number(equity.toFixed(2)) });
    basePrice = exitPrice;
  }
  
  const winningTrades = trades.filter(t => t.profit > 0);
  const losingTrades = trades.filter(t => t.profit <= 0);
  const totalProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
  
  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: Number(((winningTrades.length / trades.length) * 100).toFixed(1)),
    totalProfit: Number(totalProfit.toFixed(2)),
    totalLoss: Number(totalLoss.toFixed(2)),
    netProfit: Number((totalProfit - totalLoss).toFixed(2)),
    profitFactor: totalLoss > 0 ? Number((totalProfit / totalLoss).toFixed(2)) : totalProfit,
    maxDrawdown: Number((Math.random() * 15 + 5).toFixed(2)),
    sharpeRatio: Number((Math.random() * 2 + 0.5).toFixed(2)),
    trades,
    equityCurve,
  };
};

export default function BacktestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    symbol: string;
    name: string;
    indicator: string;
    indicatorParams: Record<string, number>;
    timeframes: string[];
  } | null;

  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [initialCapital, setInitialCapital] = useState("10000");
  const [positionSize, setPositionSize] = useState("10");
  const [stopLoss, setStopLoss] = useState("2");
  const [takeProfit, setTakeProfit] = useState("4");
  const [selectedTimeframe, setSelectedTimeframe] = useState(state?.timeframes?.[0] || "1hr");
  const [results, setResults] = useState<BacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [indicatorParams, setIndicatorParams] = useState<Record<string, number>>(state?.indicatorParams || {});

  const profitDistribution = useMemo(() => {
    if (!results) return [];
    return results.trades.map(t => ({
      id: t.id,
      profit: t.profit,
      type: t.type,
    }));
  }, [results]);

  if (!state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>No Data Selected</CardTitle>
            <CardDescription>Please select a row from the dashboard to run a backtest.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const runBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      const mockResults = generateMockResults(state.symbol, state.indicator, Number(initialCapital));
      setResults(mockResults);
      setIsRunning(false);
      toast({
        title: "Backtest Complete",
        description: `Analyzed ${mockResults.totalTrades} trades for ${state.symbol}`,
      });
    }, 1500);
  };

  const updateIndicatorParam = (key: string, value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setIndicatorParams(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const exportResults = (exportFormat: "csv" | "pdf" | "txt") => {
    if (!results) return;

    let content = "";
    let filename = `backtest_${state.symbol}_${state.indicator}_${format(new Date(), "yyyyMMdd")}`;
    let mimeType = "";

    if (exportFormat === "csv") {
      content = "Trade ID,Entry Date,Exit Date,Type,Entry Price,Exit Price,Profit,Profit %\n";
      results.trades.forEach(trade => {
        content += `${trade.id},${trade.entryDate},${trade.exitDate},${trade.type},${trade.entryPrice},${trade.exitPrice},${trade.profit},${trade.profitPercent}%\n`;
      });
      content += `\nSummary\nTotal Trades,${results.totalTrades}\nWin Rate,${results.winRate}%\nNet Profit,$${results.netProfit}\nProfit Factor,${results.profitFactor}\nMax Drawdown,${results.maxDrawdown}%\nSharpe Ratio,${results.sharpeRatio}`;
      mimeType = "text/csv";
      filename += ".csv";
    } else if (exportFormat === "txt") {
      content = `Backtest Results for ${state.symbol} - ${state.indicator}\n`;
      content += `${"=".repeat(50)}\n\n`;
      content += `Date Range: ${format(startDate, "yyyy-MM-dd")} to ${format(endDate, "yyyy-MM-dd")}\n`;
      content += `Timeframe: ${selectedTimeframe}\n`;
      content += `Initial Capital: $${initialCapital}\n\n`;
      content += `SUMMARY\n${"-".repeat(30)}\n`;
      content += `Total Trades: ${results.totalTrades}\n`;
      content += `Winning Trades: ${results.winningTrades}\n`;
      content += `Losing Trades: ${results.losingTrades}\n`;
      content += `Win Rate: ${results.winRate}%\n`;
      content += `Net Profit: $${results.netProfit}\n`;
      content += `Profit Factor: ${results.profitFactor}\n`;
      content += `Max Drawdown: ${results.maxDrawdown}%\n`;
      content += `Sharpe Ratio: ${results.sharpeRatio}\n\n`;
      content += `TRADE DETAILS\n${"-".repeat(30)}\n`;
      results.trades.forEach(trade => {
        content += `#${trade.id} | ${trade.type.toUpperCase()} | Entry: $${trade.entryPrice} @ ${trade.entryDate} | Exit: $${trade.exitPrice} @ ${trade.exitDate} | P/L: $${trade.profit} (${trade.profitPercent}%)\n`;
      });
      mimeType = "text/plain";
      filename += ".txt";
    } else if (exportFormat === "pdf") {
      // For PDF, we'll create a simple text representation
      content = `Backtest Report\n\nSymbol: ${state.symbol}\nIndicator: ${state.indicator}\nTotal Trades: ${results.totalTrades}\nWin Rate: ${results.winRate}%\nNet Profit: $${results.netProfit}`;
      mimeType = "text/plain";
      filename += ".txt"; // Simplified - would need a PDF library for actual PDF
      toast({
        title: "PDF Export",
        description: "PDF export requires a PDF library. Exported as TXT instead.",
      });
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Results exported as ${exportFormat.toUpperCase()}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Backtest</h1>
              <p className="text-sm text-muted-foreground">
                {state.symbol} • {state.indicator}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Parameters Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Parameters
              </CardTitle>
              <CardDescription>Configure backtest settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Symbol & Indicator (Read-only) */}
              <div className="space-y-2">
                <Label>Symbol</Label>
                <Input value={`${state.symbol} - ${state.name}`} disabled className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Indicator</Label>
                <Input value={state.indicator} disabled className="bg-secondary/50" />
              </div>
              {/* Editable Indicator Parameters */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Indicator Parameters
                </Label>
                <div className="space-y-2 p-3 rounded-lg bg-secondary/30 border border-border/50">
                  {Object.entries(indicatorParams).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <Label className="text-xs text-muted-foreground capitalize">{key}</Label>
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => updateIndicatorParam(key, e.target.value)}
                        className="w-20 h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeframe */}
              <div className="space-y-2">
                <Label>Timeframe</Label>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEFRAMES.map(tf => (
                      <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Capital & Risk */}
              <div className="space-y-2">
                <Label>Initial Capital ($)</Label>
                <Input type="number" value={initialCapital} onChange={(e) => setInitialCapital(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Position Size (%)</Label>
                <Input type="number" value={positionSize} onChange={(e) => setPositionSize(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Stop Loss (%)</Label>
                  <Input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Take Profit (%)</Label>
                  <Input type="number" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-2">
                <Button onClick={runBacktest} disabled={isRunning} className="w-full gap-2">
                  <Play className="h-4 w-4" />
                  {isRunning ? "Running..." : "Run Backtest"}
                </Button>
                {results && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Export Results
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => exportResults("csv")}>Export as CSV</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportResults("txt")}>Export as TXT</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportResults("pdf")}>Export as PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {results ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Win Rate</p>
                          <p className="text-2xl font-bold text-foreground">{results.winRate}%</p>
                        </div>
                        <Target className="h-8 w-8 text-primary opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Net Profit</p>
                          <p className={cn("text-2xl font-bold", results.netProfit >= 0 ? "text-buy" : "text-sell")}>
                            ${results.netProfit}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-primary opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Profit Factor</p>
                          <p className="text-2xl font-bold text-foreground">{results.profitFactor}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-primary opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Max Drawdown</p>
                          <p className="text-2xl font-bold text-sell">{results.maxDrawdown}%</p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-sell opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Equity Curve Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Equity Curve</CardTitle>
                    <CardDescription>Portfolio value over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={results.equityCurve}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            tickLine={{ stroke: "hsl(var(--border))" }}
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            tickLine={{ stroke: "hsl(var(--border))" }}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              color: "hsl(var(--foreground))"
                            }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, "Equity"]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="equity" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Profit Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trade Profit/Loss Distribution</CardTitle>
                    <CardDescription>Individual trade results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={profitDistribution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="id" 
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            tickLine={{ stroke: "hsl(var(--border))" }}
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            tickLine={{ stroke: "hsl(var(--border))" }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              color: "hsl(var(--foreground))"
                            }}
                            formatter={(value: number) => [`$${value.toFixed(2)}`, "Profit/Loss"]}
                          />
                          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                          <Bar 
                            dataKey="profit" 
                            fill="hsl(var(--primary))"
                            radius={[2, 2, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Total Trades</p>
                        <p className="font-semibold">{results.totalTrades}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Winning Trades</p>
                        <p className="font-semibold text-buy">{results.winningTrades}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Losing Trades</p>
                        <p className="font-semibold text-sell">{results.losingTrades}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Sharpe Ratio</p>
                        <p className="font-semibold">{results.sharpeRatio}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Total Profit</p>
                        <p className="font-semibold text-buy">${results.totalProfit}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Total Loss</p>
                        <p className="font-semibold text-sell">${results.totalLoss}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trade History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trade History</CardTitle>
                    <CardDescription>Individual trade results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-card">
                          <tr className="border-b border-border">
                            <th className="text-left p-2 font-medium text-muted-foreground">#</th>
                            <th className="text-left p-2 font-medium text-muted-foreground">Type</th>
                            <th className="text-left p-2 font-medium text-muted-foreground">Entry</th>
                            <th className="text-left p-2 font-medium text-muted-foreground">Exit</th>
                            <th className="text-right p-2 font-medium text-muted-foreground">Entry Price</th>
                            <th className="text-right p-2 font-medium text-muted-foreground">Exit Price</th>
                            <th className="text-right p-2 font-medium text-muted-foreground">P/L</th>
                            <th className="text-right p-2 font-medium text-muted-foreground">P/L %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.trades.map((trade) => (
                            <tr key={trade.id} className="border-b border-border/50 hover:bg-secondary/30">
                              <td className="p-2 font-mono">{trade.id}</td>
                              <td className="p-2">
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-xs font-medium uppercase",
                                  trade.type === "buy" ? "bg-buy/20 text-buy" : "bg-sell/20 text-sell"
                                )}>
                                  {trade.type}
                                </span>
                              </td>
                              <td className="p-2 text-muted-foreground text-xs">{trade.entryDate}</td>
                              <td className="p-2 text-muted-foreground text-xs">{trade.exitDate}</td>
                              <td className="p-2 text-right font-mono">${trade.entryPrice}</td>
                              <td className="p-2 text-right font-mono">${trade.exitPrice}</td>
                              <td className={cn("p-2 text-right font-mono", trade.profit >= 0 ? "text-buy" : "text-sell")}>
                                {trade.profit >= 0 ? "+" : ""}{trade.profit}
                              </td>
                              <td className={cn("p-2 text-right font-mono", trade.profitPercent >= 0 ? "text-buy" : "text-sell")}>
                                {trade.profitPercent >= 0 ? "+" : ""}{trade.profitPercent}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No Results Yet</p>
                  <p className="text-sm">Configure parameters and run the backtest</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
