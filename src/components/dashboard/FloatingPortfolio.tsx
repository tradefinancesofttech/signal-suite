import { useState, useEffect } from "react";
import { X, ChevronUp, ChevronDown, TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface OpenPosition {
  id: string;
  symbol: string;
  name: string;
  type: "buy" | "sell";
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  entryTime: string;
  pnl: number;
  pnlPercent: number;
}

interface FloatingPortfolioProps {
  className?: string;
}

// Mock data for demo - in real app this would come from a trading service/context
const generateMockPositions = (): OpenPosition[] => {
  const stored = localStorage.getItem("openPositions");
  if (stored) {
    return JSON.parse(stored);
  }

  const mockPositions: OpenPosition[] = [
    {
      id: "1",
      symbol: "AAPL",
      name: "Apple Inc.",
      type: "buy",
      entryPrice: 178.50,
      currentPrice: 182.30,
      quantity: 10,
      entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      pnl: 38.00,
      pnlPercent: 2.13,
    },
    {
      id: "2",
      symbol: "BTC/USD",
      name: "Bitcoin",
      type: "buy",
      entryPrice: 43250.00,
      currentPrice: 42800.00,
      quantity: 0.5,
      entryTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      pnl: -225.00,
      pnlPercent: -1.04,
    },
    {
      id: "3",
      symbol: "EUR/USD",
      name: "Euro/USD",
      type: "sell",
      entryPrice: 1.0892,
      currentPrice: 1.0875,
      quantity: 10000,
      entryTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      pnl: 17.00,
      pnlPercent: 0.16,
    },
  ];

  localStorage.setItem("openPositions", JSON.stringify(mockPositions));
  return mockPositions;
};

export const FloatingPortfolio = ({ className }: FloatingPortfolioProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [positions, setPositions] = useState<OpenPosition[]>([]);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<OpenPosition | null>(null);
  const [closeAllDialogOpen, setCloseAllDialogOpen] = useState(false);

  useEffect(() => {
    setPositions(generateMockPositions());

    // Simulate price updates every 3 seconds
    const interval = setInterval(() => {
      setPositions(prev => prev.map(pos => {
        const priceChange = (Math.random() - 0.5) * 2;
        const newPrice = pos.currentPrice + priceChange;
        const pnl = pos.type === "buy" 
          ? (newPrice - pos.entryPrice) * pos.quantity 
          : (pos.entryPrice - newPrice) * pos.quantity;
        const pnlPercent = ((pnl / (pos.entryPrice * pos.quantity)) * 100);
        
        return {
          ...pos,
          currentPrice: Number(newPrice.toFixed(pos.symbol.includes("/") ? 4 : 2)),
          pnl: Number(pnl.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2)),
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const totalPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const openTradesCount = positions.length;

  const handleClosePosition = (position: OpenPosition) => {
    setSelectedPosition(position);
    setCloseDialogOpen(true);
  };

  const confirmClosePosition = () => {
    if (selectedPosition) {
      const updatedPositions = positions.filter(p => p.id !== selectedPosition.id);
      setPositions(updatedPositions);
      localStorage.setItem("openPositions", JSON.stringify(updatedPositions));
      toast({
        title: "Position Closed",
        description: `Closed ${selectedPosition.symbol} with P&L: $${selectedPosition.pnl.toFixed(2)}`,
      });
      setCloseDialogOpen(false);
      setSelectedPosition(null);
    }
  };

  const handleCloseAll = () => {
    setCloseAllDialogOpen(true);
  };

  const confirmCloseAll = () => {
    setPositions([]);
    localStorage.setItem("openPositions", JSON.stringify([]));
    toast({
      title: "All Positions Closed",
      description: `Closed ${openTradesCount} positions with total P&L: $${totalPnl.toFixed(2)}`,
    });
    setCloseAllDialogOpen(false);
  };

  if (isMinimized) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Button
          onClick={() => setIsMinimized(false)}
          className={cn(
            "h-14 px-4 shadow-lg gap-2 rounded-full",
            totalPnl >= 0 
              ? "bg-green-500/90 hover:bg-green-500 text-white" 
              : "bg-red-500/90 hover:bg-red-500 text-white"
          )}
        >
          <Wallet className="h-5 w-5" />
          <span className="font-bold">{openTradesCount}</span>
          <span className="text-sm">
            {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(2)}
          </span>
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card className={cn(
        "fixed bottom-4 right-4 z-50 w-80 shadow-2xl border-border/50 backdrop-blur-sm bg-card/95",
        className
      )}>
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Open Positions
              <Badge variant="secondary" className="text-xs">
                {openTradesCount}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Total P&L Summary */}
          <div className={cn(
            "flex items-center justify-between p-2 rounded-lg mt-2",
            totalPnl >= 0 ? "bg-green-500/10" : "bg-red-500/10"
          )}>
            <span className="text-xs text-muted-foreground">Total P&L</span>
            <div className="flex items-center gap-1">
              {totalPnl >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={cn(
                "font-bold text-sm",
                totalPnl >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
              </span>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="px-4 pb-3">
            {positions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No open positions
              </div>
            ) : (
              <>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {positions.map((position) => (
                      <div
                        key={position.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{position.symbol}</span>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px] px-1.5 py-0",
                                position.type === "buy" 
                                  ? "border-green-500/50 text-green-500" 
                                  : "border-red-500/50 text-red-500"
                              )}
                            >
                              {position.type.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>{position.quantity} @ {position.entryPrice}</span>
                            <span>→ {position.currentPrice}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className={cn(
                              "text-sm font-semibold",
                              position.pnl >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                            </p>
                            <p className={cn(
                              "text-[10px]",
                              position.pnlPercent >= 0 ? "text-green-500/70" : "text-red-500/70"
                            )}>
                              {position.pnlPercent >= 0 ? "+" : ""}{position.pnlPercent.toFixed(2)}%
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => handleClosePosition(position)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {positions.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
                    onClick={handleCloseAll}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Close All Positions
                  </Button>
                )}
              </>
            )}
          </CardContent>
        )}
      </Card>

      {/* Close Single Position Dialog */}
      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Position</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this position?
              {selectedPosition && (
                <div className="mt-3 p-3 rounded-lg bg-secondary/50 space-y-1">
                  <div className="flex justify-between">
                    <span>Symbol:</span>
                    <span className="font-medium">{selectedPosition.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className={cn(
                      "font-medium",
                      selectedPosition.type === "buy" ? "text-green-500" : "text-red-500"
                    )}>
                      {selectedPosition.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current P&L:</span>
                    <span className={cn(
                      "font-bold",
                      selectedPosition.pnl >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {selectedPosition.pnl >= 0 ? "+" : ""}${selectedPosition.pnl.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmClosePosition}
              className="bg-red-500 hover:bg-red-600"
            >
              Close Position
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close All Positions Dialog */}
      <AlertDialog open={closeAllDialogOpen} onOpenChange={setCloseAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close All Positions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close all {openTradesCount} open positions?
              <div className="mt-3 p-3 rounded-lg bg-secondary/50">
                <div className="flex justify-between">
                  <span>Total P&L:</span>
                  <span className={cn(
                    "font-bold",
                    totalPnl >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCloseAll}
              className="bg-red-500 hover:bg-red-600"
            >
              Close All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
