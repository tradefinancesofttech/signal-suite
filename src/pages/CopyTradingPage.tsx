import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import {
  Users,
  TrendingUp,
  TrendingDown,
  Copy,
  UserPlus,
  UserMinus,
  Settings,
  Star,
  Shield,
  BarChart3,
  Target,
  Activity,
  ArrowLeft,
  Wallet,
  X,
  AlertCircle,
} from "lucide-react";
import {
  TopTrader,
  FollowedTrader,
  CopiedTrade,
  getTopTraders,
  getFollowedTraders,
  followTrader,
  unfollowTrader,
  updateFollowSettings,
  getCopiedTrades,
} from "@/lib/copyTradingService";
import { OpenPosition } from "@/components/dashboard/FloatingPortfolio";

interface TraderCardProps {
  trader: TopTrader;
  isFollowed: boolean;
  onFollow: (trader: TopTrader) => void;
  onUnfollow: (traderId: string) => void;
  onSettings?: (trader: FollowedTrader) => void;
  followedData?: FollowedTrader;
}

const TraderCard = ({ trader, isFollowed, onFollow, onUnfollow, onSettings, followedData }: TraderCardProps) => {
  const riskColors = {
    low: "bg-buy/20 text-buy",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-sell/20 text-sell",
  };

  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {trader.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{trader.name}</CardTitle>
                {trader.isVerified && (
                  <Shield className="h-4 w-4 text-primary" />
                )}
              </div>
              <CardDescription className="text-xs">@{trader.username}</CardDescription>
            </div>
          </div>
          <Badge className={cn("text-xs", riskColors[trader.riskLevel])}>
            {trader.riskLevel.toUpperCase()} RISK
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-secondary/50">
            <div className="text-lg font-bold text-buy">{trader.winRate}%</div>
            <div className="text-[10px] text-muted-foreground">Win Rate</div>
          </div>
          <div className="p-2 rounded-lg bg-secondary/50">
            <div className={cn("text-lg font-bold", trader.monthlyReturn >= 0 ? "text-buy" : "text-sell")}>
              {trader.monthlyReturn >= 0 ? "+" : ""}{trader.monthlyReturn}%
            </div>
            <div className="text-[10px] text-muted-foreground">Monthly</div>
          </div>
          <div className="p-2 rounded-lg bg-secondary/50">
            <div className="text-lg font-bold text-foreground">{trader.followers.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">Followers</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{trader.tradingStyle}</span>
          <span>{trader.totalTrades.toLocaleString()} trades</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {trader.instruments.slice(0, 3).map((inst) => (
            <Badge key={inst} variant="outline" className="text-[10px] px-2 py-0">
              {inst}
            </Badge>
          ))}
          {trader.instruments.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0">
              +{trader.instruments.length - 3}
            </Badge>
          )}
        </div>

        <Separator className="bg-border/50" />

        <div className="flex items-center gap-2">
          {isFollowed ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSettings?.(followedData!)}
                className="flex-1 gap-1"
              >
                <Settings className="h-3 w-3" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUnfollow(trader.id)}
                className="flex-1 gap-1 border-sell/50 text-sell hover:bg-sell/10"
              >
                <UserMinus className="h-3 w-3" />
                Unfollow
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => onFollow(trader)}
              className="w-full gap-1"
            >
              <UserPlus className="h-3 w-3" />
              Follow & Copy
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Generate mock positions
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

const CopyTradingPage = () => {
  const navigate = useNavigate();
  const [traders] = useState<TopTrader[]>(getTopTraders());
  const [following, setFollowing] = useState<FollowedTrader[]>(getFollowedTraders());
  const [copiedTrades, setCopiedTrades] = useState<CopiedTrade[]>([]);
  const [settingsTrader, setSettingsTrader] = useState<FollowedTrader | null>(null);
  const [copyPercentage, setCopyPercentage] = useState(50);
  const [maxLossLimit, setMaxLossLimit] = useState(500);
  const [autoCopy, setAutoCopy] = useState(true);

  // Live positions state
  const [positions, setPositions] = useState<OpenPosition[]>([]);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<OpenPosition | null>(null);
  const [closeAllDialogOpen, setCloseAllDialogOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setFollowing(getFollowedTraders());
      setCopiedTrades(getCopiedTrades());
    };

    window.addEventListener("followedTradersUpdated", handleUpdate);
    handleUpdate();

    return () => {
      window.removeEventListener("followedTradersUpdated", handleUpdate);
    };
  }, []);

  // Load and update positions
  useEffect(() => {
    setPositions(generateMockPositions());

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

  const confirmCloseAll = () => {
    setPositions([]);
    localStorage.setItem("openPositions", JSON.stringify([]));
    toast({
      title: "All Positions Closed",
      description: `Closed ${positions.length} positions with total P&L: $${totalPnl.toFixed(2)}`,
    });
    setCloseAllDialogOpen(false);
  };

  const handleFollow = (trader: TopTrader) => {
    try {
      followTrader(trader, copyPercentage, maxLossLimit, autoCopy);
      toast({
        title: "Following Trader",
        description: `You are now copying ${trader.name}'s trades.`,
      });
    } catch (error) {
      toast({
        title: "Already Following",
        description: "You are already following this trader.",
        variant: "destructive",
      });
    }
  };

  const handleUnfollow = (traderId: string) => {
    unfollowTrader(traderId);
    toast({
      title: "Unfollowed Trader",
      description: "You will no longer copy this trader's trades.",
    });
  };

  const handleSettingsSave = () => {
    if (!settingsTrader) return;

    updateFollowSettings(settingsTrader.id, {
      copyPercentage,
      maxLossLimit,
      autoCopy,
    });

    toast({
      title: "Settings Updated",
      description: "Copy trading settings have been updated.",
    });
    setSettingsTrader(null);
  };

  const openSettings = (trader: FollowedTrader) => {
    setSettingsTrader(trader);
    setCopyPercentage(trader.copyPercentage);
    setMaxLossLimit(trader.maxLossLimit);
    setAutoCopy(trader.autoCopy);
  };

  const totalCopiedPnL = copiedTrades.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                <Copy className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold text-gradient">Copy Trading</span>
            </div>
          </div>
          
          {/* Following Stats */}
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Users className="h-4 w-4 mr-1" />
              Following: {following.length}
            </Badge>
            <Badge 
              variant="secondary" 
              className={cn(
                "text-sm px-3 py-1",
                totalCopiedPnL >= 0 ? "bg-buy/20 text-buy" : "bg-sell/20 text-sell"
              )}
            >
              P&L: {totalCopiedPnL >= 0 ? "+" : ""}${totalCopiedPnL.toFixed(2)}
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Live Positions */}
          <div className="lg:col-span-1">
            <Card className="bg-card/50 border-border/50 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Live Positions
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {positions.length}
                  </Badge>
                </CardTitle>
                
                {/* Total P&L Summary */}
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg mt-2",
                  totalPnl >= 0 ? "bg-buy/10" : "bg-sell/10"
                )}>
                  <span className="text-sm text-muted-foreground">Total P&L</span>
                  <div className="flex items-center gap-2">
                    {totalPnl >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-buy" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-sell" />
                    )}
                    <span className={cn(
                      "font-bold text-lg",
                      totalPnl >= 0 ? "text-buy" : "text-sell"
                    )}>
                      {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                {positions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No open positions
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[400px] pr-2">
                      <div className="space-y-2">
                        {positions.map((position) => (
                          <div
                            key={position.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{position.symbol}</span>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-[10px] px-1.5 py-0",
                                    position.type === "buy" 
                                      ? "border-buy/50 text-buy" 
                                      : "border-sell/50 text-sell"
                                  )}
                                >
                                  {position.type.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <span>{position.quantity} @ {position.entryPrice}</span>
                                <span>→ {position.currentPrice}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className={cn(
                                  "text-sm font-semibold",
                                  position.pnl >= 0 ? "text-buy" : "text-sell"
                                )}>
                                  {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                                </p>
                                <p className={cn(
                                  "text-[10px]",
                                  position.pnlPercent >= 0 ? "text-buy/70" : "text-sell/70"
                                )}>
                                  {position.pnlPercent >= 0 ? "+" : ""}{position.pnlPercent.toFixed(2)}%
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-sell hover:bg-sell/10"
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
                        className="w-full mt-3 text-sell border-sell/30 hover:bg-sell/10 hover:text-sell"
                        onClick={() => setCloseAllDialogOpen(true)}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Close All Positions
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Copy Trading */}
          <div className="lg:col-span-2">
            {settingsTrader ? (
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {settingsTrader.avatar}
                    </div>
                    <div>
                      <span>{settingsTrader.name}</span>
                      <p className="text-sm text-muted-foreground font-normal">@{settingsTrader.username}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Copy Percentage: {copyPercentage}%</label>
                    <Slider
                      value={[copyPercentage]}
                      onValueChange={([v]) => setCopyPercentage(v)}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Percentage of trader's position size to copy
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Loss Limit ($)</label>
                    <Input
                      type="number"
                      value={maxLossLimit}
                      onChange={(e) => setMaxLossLimit(Number(e.target.value))}
                      min={100}
                      max={10000}
                      className="bg-secondary/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-stop copying when losses reach this limit
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Auto Copy</label>
                      <p className="text-xs text-muted-foreground">
                        Automatically copy all new trades
                      </p>
                    </div>
                    <Switch checked={autoCopy} onCheckedChange={setAutoCopy} />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setSettingsTrader(null)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleSettingsSave} className="flex-1">
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="discover" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="discover" className="gap-1">
                    <Star className="h-4 w-4" />
                    Discover
                  </TabsTrigger>
                  <TabsTrigger value="following" className="gap-1">
                    <Users className="h-4 w-4" />
                    Following ({following.length})
                  </TabsTrigger>
                  <TabsTrigger value="trades" className="gap-1">
                    <Activity className="h-4 w-4" />
                    Copied Trades
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="discover" className="mt-4">
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {traders.map((trader) => (
                        <TraderCard
                          key={trader.id}
                          trader={trader}
                          isFollowed={following.some((f) => f.id === trader.id)}
                          onFollow={handleFollow}
                          onUnfollow={handleUnfollow}
                          onSettings={openSettings}
                          followedData={following.find((f) => f.id === trader.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="following" className="mt-4">
                  <ScrollArea className="h-[600px] pr-4">
                    {following.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-semibold mb-2">Not Following Anyone</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Browse the Discover tab to find profitable traders to follow and copy.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {following.map((trader) => (
                          <TraderCard
                            key={trader.id}
                            trader={trader}
                            isFollowed={true}
                            onFollow={handleFollow}
                            onUnfollow={handleUnfollow}
                            onSettings={openSettings}
                            followedData={trader}
                          />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="trades" className="mt-4">
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-card/50">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">{copiedTrades.length}</div>
                          <div className="text-xs text-muted-foreground">Open Trades</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-card/50">
                        <CardContent className="p-4 text-center">
                          <div className={cn("text-2xl font-bold", totalCopiedPnL >= 0 ? "text-buy" : "text-sell")}>
                            {totalCopiedPnL >= 0 ? "+" : ""}${totalCopiedPnL.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">Total P&L</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-card/50">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">{following.length}</div>
                          <div className="text-xs text-muted-foreground">Traders</div>
                        </CardContent>
                      </Card>
                    </div>

                    <ScrollArea className="h-[500px]">
                      {copiedTrades.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="font-semibold mb-2">No Copied Trades</h3>
                          <p className="text-sm text-muted-foreground max-w-sm">
                            Follow traders with Auto Copy enabled to start copying their trades.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {copiedTrades.map((trade) => (
                            <Card key={trade.id} className="bg-card/30">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "h-8 w-8 rounded-full flex items-center justify-center",
                                      trade.type === "buy" ? "bg-buy/20" : "bg-sell/20"
                                    )}>
                                      {trade.type === "buy" ? (
                                        <TrendingUp className="h-4 w-4 text-buy" />
                                      ) : (
                                        <TrendingDown className="h-4 w-4 text-sell" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-sm">{trade.symbol}</div>
                                      <div className="text-xs text-muted-foreground">
                                        via {trade.traderName}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={cn(
                                      "font-semibold",
                                      trade.pnl >= 0 ? "text-buy" : "text-sell"
                                    )}>
                                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                                    </div>
                                    <div className={cn(
                                      "text-xs",
                                      trade.pnlPercent >= 0 ? "text-buy" : "text-sell"
                                    )}>
                                      {trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>

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
                      selectedPosition.type === "buy" ? "text-buy" : "text-sell"
                    )}>
                      {selectedPosition.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current P&L:</span>
                    <span className={cn(
                      "font-bold",
                      selectedPosition.pnl >= 0 ? "text-buy" : "text-sell"
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
              className="bg-sell hover:bg-sell/90"
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
              Are you sure you want to close all {positions.length} open positions?
              <div className="mt-3 p-3 rounded-lg bg-secondary/50">
                <div className="flex justify-between">
                  <span>Total P&L:</span>
                  <span className={cn(
                    "font-bold",
                    totalPnl >= 0 ? "text-buy" : "text-sell"
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
              className="bg-sell hover:bg-sell/90"
            >
              Close All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CopyTradingPage;
