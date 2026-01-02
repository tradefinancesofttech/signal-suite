import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  FileDown,
  Layers,
  TrendingUp,
  Target,
  Activity,
  CheckCircle,
  Clock,
} from "lucide-react";
import { BacktestTemplate, getTemplates } from "@/lib/templateService";

interface LoadTemplateButtonProps {
  onLoadTemplate: (template: BacktestTemplate) => void;
}

export const LoadTemplateButton = ({ onLoadTemplate }: LoadTemplateButtonProps) => {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<BacktestTemplate[]>([]);

  useEffect(() => {
    setTemplates(getTemplates());

    const handleUpdate = (e: CustomEvent<BacktestTemplate[]>) => {
      setTemplates(e.detail);
    };

    window.addEventListener("templatesUpdated", handleUpdate as EventListener);
    return () => {
      window.removeEventListener("templatesUpdated", handleUpdate as EventListener);
    };
  }, []);

  const handleLoad = (template: BacktestTemplate) => {
    onLoadTemplate(template);
    setOpen(false);
    toast({
      title: "Template Loaded",
      description: `"${template.name}" configuration applied successfully.`,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileDown className="h-4 w-4" />
          Load Template
          {templates.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {templates.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Load Backtest Template
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4 mt-4">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Layers className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Templates Saved</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Go to the Backtest page to create and save templates with your best indicator configurations.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
                  onClick={() => handleLoad(template)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {template.name}
                          <Badge variant="outline" className="text-xs">
                            {template.indicator}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {template.symbol} • {template.symbolName}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Apply
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Results if available */}
                    {template.lastResults && (
                      <div className="grid grid-cols-4 gap-2">
                        <div className="p-2 rounded-lg bg-secondary/50 text-center">
                          <div className={cn(
                            "text-sm font-bold",
                            template.lastResults.winRate >= 60 ? "text-buy" : 
                            template.lastResults.winRate >= 40 ? "text-yellow-400" : "text-sell"
                          )}>
                            {template.lastResults.winRate.toFixed(1)}%
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                            <Target className="h-3 w-3" />
                            Win Rate
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-secondary/50 text-center">
                          <div className={cn(
                            "text-sm font-bold",
                            template.lastResults.netProfit >= 0 ? "text-buy" : "text-sell"
                          )}>
                            {template.lastResults.netProfit >= 0 ? "+" : ""}
                            ${template.lastResults.netProfit.toFixed(0)}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Net Profit
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-secondary/50 text-center">
                          <div className={cn(
                            "text-sm font-bold",
                            template.lastResults.profitFactor >= 1.5 ? "text-buy" : 
                            template.lastResults.profitFactor >= 1 ? "text-yellow-400" : "text-sell"
                          )}>
                            {template.lastResults.profitFactor.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                            <Activity className="h-3 w-3" />
                            Profit Factor
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-secondary/50 text-center">
                          <div className="text-sm font-bold text-foreground">
                            {template.lastResults.totalTrades}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Total Trades
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeframes */}
                    <div className="flex flex-wrap gap-1">
                      {template.timeframes.map((tf) => (
                        <Badge key={tf} variant="secondary" className="text-xs">
                          {tf}
                        </Badge>
                      ))}
                    </div>

                    {/* Parameters */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Params:</span>
                      {Object.entries(template.indicatorParams).slice(0, 3).map(([key, val]) => (
                        <Badge key={key} variant="outline" className="text-[10px]">
                          {key}: {val}
                        </Badge>
                      ))}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Updated: {formatDate(template.updatedAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
