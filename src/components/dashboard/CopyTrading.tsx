import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  AlertTriangle,
  BarChart3,
  Target,
  Activity,
  CheckCircle,
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

export const CopyTrading = () => {
  const [open, setOpen] = useState(false);
  const [traders] = useState<TopTrader[]>(getTopTraders());
  const [following, setFollowing] = useState<FollowedTrader[]>(getFollowedTraders());
  const [copiedTrades, setCopiedTrades] = useState<CopiedTrade[]>([]);
  const [settingsTrader, setSettingsTrader] = useState<FollowedTrader | null>(null);
  const [copyPercentage, setCopyPercentage] = useState(50);
  const [maxLossLimit, setMaxLossLimit] = useState(500);
  const [autoCopy, setAutoCopy] = useState(true);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Copy className="h-4 w-4" />
          Copy Trading
          {following.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {following.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Copy Trading
          </DialogTitle>
        </DialogHeader>

        {settingsTrader ? (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {settingsTrader.avatar}
              </div>
              <div>
                <h3 className="font-semibold">{settingsTrader.name}</h3>
                <p className="text-sm text-muted-foreground">@{settingsTrader.username}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
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
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setSettingsTrader(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSettingsSave} className="flex-1">
                Save Settings
              </Button>
            </div>
          </div>
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
              <ScrollArea className="h-[500px] pr-4">
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
              <ScrollArea className="h-[500px] pr-4">
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

                <ScrollArea className="h-[400px]">
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
      </DialogContent>
    </Dialog>
  );
};
