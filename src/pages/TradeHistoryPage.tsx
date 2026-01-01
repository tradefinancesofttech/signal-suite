import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Download, Trash2, TrendingUp, TrendingDown, DollarSign, Target, History, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getTradeHistory, clearTradeHistory, TradeHistoryItem } from "@/lib/tradeService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TradeHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<TradeHistoryItem[]>([]);
  const [filterSymbol, setFilterSymbol] = useState("");
  const [filterType, setFilterType] = useState<"all" | "buy" | "sell">("all");
  const [filterAccount, setFilterAccount] = useState<"all" | "paper" | "live">("all");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  useEffect(() => {
    setHistory(getTradeHistory());
    
    const handleUpdate = (e: CustomEvent) => {
      setHistory(e.detail);
    };
    
    window.addEventListener("tradeHistoryUpdated", handleUpdate as EventListener);
    return () => window.removeEventListener("tradeHistoryUpdated", handleUpdate as EventListener);
  }, []);

  const filteredHistory = history.filter(trade => {
    if (filterSymbol && !trade.symbol.toLowerCase().includes(filterSymbol.toLowerCase())) {
      return false;
    }
    if (filterType !== "all" && trade.type !== filterType) {
      return false;
    }
    if (filterAccount !== "all" && trade.accountType !== filterAccount) {
      return false;
    }
    return true;
  });

  // Calculate stats
  const totalTrades = filteredHistory.length;
  const winningTrades = filteredHistory.filter(t => t.pnl > 0).length;
  const losingTrades = filteredHistory.filter(t => t.pnl <= 0).length;
  const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : "0";
  const totalPnl = filteredHistory.reduce((sum, t) => sum + t.pnl, 0);
  const avgPnl = totalTrades > 0 ? totalPnl / totalTrades : 0;

  const handleClearHistory = () => {
    clearTradeHistory();
    setClearDialogOpen(false);
    toast({
      title: "History Cleared",
      description: "All trade history has been deleted.",
    });
  };

  const exportHistory = () => {
    if (filteredHistory.length === 0) {
      toast({
        title: "No Data",
        description: "No trade history to export.",
        variant: "destructive",
      });
      return;
    }

    let csv = "ID,Symbol,Type,Entry Time,Exit Time,Entry Price,Exit Price,Quantity,P&L,P&L %,Account\n";
    filteredHistory.forEach(trade => {
      csv += `${trade.id},${trade.symbol},${trade.type},${trade.entryTime},${trade.exitTime},${trade.entryPrice},${trade.exitPrice},${trade.quantity},${trade.pnl},${trade.pnlPercent}%,${trade.accountType}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trade_history_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredHistory.length} trades.`,
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
              <h1 className="text-xl font-bold text-foreground">Trade History</h1>
              <p className="text-sm text-muted-foreground">
                View all your past trades and performance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportHistory}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <History className="h-8 w-8 text-primary opacity-50" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Trades</p>
                  <p className="text-2xl font-bold">{totalTrades}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary opacity-50" />
                <div>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold">{winRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-buy opacity-50" />
                <div>
                  <p className="text-xs text-muted-foreground">Winning</p>
                  <p className="text-2xl font-bold text-buy">{winningTrades}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-sell opacity-50" />
                <div>
                  <p className="text-xs text-muted-foreground">Losing</p>
                  <p className="text-2xl font-bold text-sell">{losingTrades}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-primary opacity-50" />
                <div>
                  <p className="text-xs text-muted-foreground">Total P&L</p>
                  <p className={cn("text-2xl font-bold", totalPnl >= 0 ? "text-buy" : "text-sell")}>
                    {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Input
                placeholder="Search symbol..."
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                className="w-40"
              />
              <Select value={filterType} onValueChange={(v: "all" | "buy" | "sell") => setFilterType(v)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAccount} onValueChange={(v: "all" | "paper" | "live") => setFilterAccount(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="paper">Paper</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive ml-auto"
                  onClick={() => setClearDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trade History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Log</CardTitle>
            <CardDescription>
              Showing {filteredHistory.length} of {history.length} trades
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No Trade History</p>
                <p className="text-sm">Your closed trades will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/30">
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">Symbol</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Entry</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Exit</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Entry Price</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Exit Price</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Qty</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">P&L</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Account</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((trade) => (
                      <tr key={trade.id} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="p-3">
                          <div className="font-medium">{trade.symbol}</div>
                          <div className="text-xs text-muted-foreground">{trade.name}</div>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              trade.type === "buy"
                                ? "border-buy/50 text-buy"
                                : "border-sell/50 text-sell"
                            )}
                          >
                            {trade.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {format(new Date(trade.entryTime), "MMM dd, HH:mm")}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {format(new Date(trade.exitTime), "MMM dd, HH:mm")}
                        </td>
                        <td className="p-3 text-right font-mono">${trade.entryPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono">${trade.exitPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono">{trade.quantity}</td>
                        <td className="p-3 text-right">
                          <div className={cn("font-semibold", trade.pnl >= 0 ? "text-buy" : "text-sell")}>
                            {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                          </div>
                          <div className={cn("text-xs", trade.pnlPercent >= 0 ? "text-buy/70" : "text-sell/70")}>
                            {trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary" className="text-xs">
                            {trade.accountType}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Clear History Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all trade history? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearHistory}
              className="bg-destructive hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
