import { useState, useEffect } from "react";
import { Bell, BellOff, Plus, Trash2, DollarSign, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getPnLAlerts, addPnLAlert, deletePnLAlert, togglePnLAlert, PnLAlert } from "@/lib/tradeService";

export const PnLAlertSettings = () => {
  const [alerts, setAlerts] = useState<PnLAlert[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: "profit" as "profit" | "loss" | "percent",
    threshold: "",
    symbol: "",
  });

  useEffect(() => {
    setAlerts(getPnLAlerts());
  }, []);

  const handleAddAlert = () => {
    if (!newAlert.threshold) {
      toast({
        title: "Error",
        description: "Please enter a threshold value.",
        variant: "destructive",
      });
      return;
    }

    const threshold = parseFloat(newAlert.threshold);
    if (isNaN(threshold) || threshold <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }

    addPnLAlert({
      type: newAlert.type,
      threshold,
      symbol: newAlert.symbol || undefined,
      enabled: true,
    });

    setAlerts(getPnLAlerts());
    setNewAlert({ type: "profit", threshold: "", symbol: "" });
    setDialogOpen(false);

    toast({
      title: "Alert Created",
      description: `Alert will trigger when ${newAlert.type === "percent" ? "P&L reaches" : newAlert.type} ${newAlert.type === "percent" ? `±${threshold}%` : `$${threshold}`}`,
    });
  };

  const handleDeleteAlert = (alertId: string) => {
    deletePnLAlert(alertId);
    setAlerts(getPnLAlerts());
    toast({
      title: "Alert Deleted",
      description: "P&L alert has been removed.",
    });
  };

  const handleToggleAlert = (alertId: string) => {
    togglePnLAlert(alertId);
    setAlerts(getPnLAlerts());
  };

  const getAlertLabel = (alert: PnLAlert) => {
    const target = alert.symbol ? alert.symbol : "Total P&L";
    if (alert.type === "profit") {
      return `${target} ≥ $${alert.threshold}`;
    } else if (alert.type === "loss") {
      return `${target} ≤ -$${alert.threshold}`;
    } else {
      return `${target} ± ${alert.threshold}%`;
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bell className="h-4 w-4" />
          P&L Alerts
          {alerts.filter(a => a.enabled).length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {alerts.filter(a => a.enabled).length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            P&L Alert Settings
          </DialogTitle>
          <DialogDescription>
            Get notified when your P&L reaches certain thresholds.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Existing Alerts */}
          {alerts.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Alerts</Label>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    alert.enabled
                      ? "bg-secondary/30 border-border"
                      : "bg-muted/30 border-border/50 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={alert.enabled}
                      onCheckedChange={() => handleToggleAlert(alert.id)}
                    />
                    <div>
                      <p className="text-sm font-medium">{getAlertLabel(alert)}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {alert.type} alert
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteAlert(alert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <BellOff className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No alerts configured</p>
            </div>
          )}

          {/* Add New Alert */}
          <div className="space-y-3 pt-4 border-t border-border">
            <Label className="text-sm font-medium">Create New Alert</Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Alert Type</Label>
                <Select
                  value={newAlert.type}
                  onValueChange={(v: "profit" | "loss" | "percent") =>
                    setNewAlert({ ...newAlert, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profit">
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-buy" />
                        Profit Target
                      </span>
                    </SelectItem>
                    <SelectItem value="loss">
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-sell" />
                        Stop Loss
                      </span>
                    </SelectItem>
                    <SelectItem value="percent">
                      <span className="flex items-center gap-2">
                        <Percent className="h-3 w-3 text-primary" />
                        Percentage
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  {newAlert.type === "percent" ? "Threshold (%)" : "Amount ($)"}
                </Label>
                <Input
                  type="number"
                  placeholder={newAlert.type === "percent" ? "e.g. 5" : "e.g. 100"}
                  value={newAlert.threshold}
                  onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Symbol (optional - leave empty for total P&L)
              </Label>
              <Input
                placeholder="e.g. AAPL, BTC/USD"
                value={newAlert.symbol}
                onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddAlert} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
