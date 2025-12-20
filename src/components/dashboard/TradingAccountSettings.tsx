import { useState, useEffect } from "react";
import { Settings, Wallet, Globe, Key, User, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export interface TradingAccountConfig {
  accountType: "paper" | "live";
  paperBalance: number;
  broker: string;
  apiKey: string;
  apiSecret: string;
  serverUrl: string;
}

const STORAGE_KEY = "trading_account_config";

const DEFAULT_CONFIG: TradingAccountConfig = {
  accountType: "paper",
  paperBalance: 100000,
  broker: "",
  apiKey: "",
  apiSecret: "",
  serverUrl: "",
};

export const loadAccountConfig = (): TradingAccountConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load account config:", e);
  }
  return DEFAULT_CONFIG;
};

export const saveAccountConfig = (config: TradingAccountConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save account config:", e);
  }
};

const BROKERS = [
  { value: "alpaca", label: "Alpaca" },
  { value: "ibkr", label: "Interactive Brokers" },
  { value: "tradier", label: "Tradier" },
  { value: "tdameritrade", label: "TD Ameritrade" },
  { value: "binance", label: "Binance" },
  { value: "coinbase", label: "Coinbase" },
  { value: "custom", label: "Custom API" },
];

export const TradingAccountSettings = () => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<TradingAccountConfig>(loadAccountConfig);

  useEffect(() => {
    if (open) {
      setConfig(loadAccountConfig());
    }
  }, [open]);

  const handleSave = () => {
    saveAccountConfig(config);
    toast({
      title: "Settings Saved",
      description: `${config.accountType === "paper" ? "Paper" : "Live"} account configured successfully.`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Settings className="h-4 w-4" />
          <span className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${config.accountType === "live" ? "bg-buy" : "bg-yellow-500"}`} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Trading Account Settings
          </DialogTitle>
          <DialogDescription>
            Configure your paper or live trading account credentials.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Account Type Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-base">Account Type</Label>
              <p className="text-xs text-muted-foreground">
                {config.accountType === "paper" ? "Practice with virtual money" : "Trade with real funds"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${config.accountType === "paper" ? "text-yellow-500 font-medium" : "text-muted-foreground"}`}>
                Paper
              </span>
              <Switch
                checked={config.accountType === "live"}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, accountType: checked ? "live" : "paper" })
                }
              />
              <span className={`text-sm ${config.accountType === "live" ? "text-buy font-medium" : "text-muted-foreground"}`}>
                Live
              </span>
            </div>
          </div>

          {/* Paper Account Settings */}
          {config.accountType === "paper" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paperBalance" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Starting Balance
                </Label>
                <Input
                  id="paperBalance"
                  type="number"
                  value={config.paperBalance}
                  onChange={(e) => setConfig({ ...config, paperBalance: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary/50 border-border/50"
                />
              </div>
            </div>
          )}

          {/* Live Account Settings */}
          {config.accountType === "live" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="broker" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Broker
                </Label>
                <Select
                  value={config.broker}
                  onValueChange={(value) => setConfig({ ...config, broker: value })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border/50">
                    <SelectValue placeholder="Select broker" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {BROKERS.map((broker) => (
                      <SelectItem key={broker.value} value={broker.value}>
                        {broker.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Enter your API key"
                  className="bg-secondary/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiSecret" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  API Secret
                </Label>
                <Input
                  id="apiSecret"
                  type="password"
                  value={config.apiSecret}
                  onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                  placeholder="Enter your API secret"
                  className="bg-secondary/50 border-border/50"
                />
              </div>

              {config.broker === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="serverUrl" className="flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Server URL
                  </Label>
                  <Input
                    id="serverUrl"
                    type="url"
                    value={config.serverUrl}
                    onChange={(e) => setConfig({ ...config, serverUrl: e.target.value })}
                    placeholder="https://api.yourbroker.com"
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
