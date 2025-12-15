import { Activity, LogOut, Settings, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  licenseKey?: string;
  macAddress?: string;
}

export const DashboardHeader = ({ licenseKey = "XXXX-XXXX-XXXX", macAddress = "XX:XX:XX:XX:XX:XX" }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-gradient">TradeSignals Pro</span>
        </div>

        {/* License Info */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
            <Shield className="h-4 w-4 text-success" />
            <span className="text-xs text-success font-medium">License Active</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            <span className="text-muted-foreground/60">Key:</span> {licenseKey}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            <span className="text-muted-foreground/60">MAC:</span> {macAddress}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
