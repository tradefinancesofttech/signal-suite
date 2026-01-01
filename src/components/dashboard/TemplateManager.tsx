import { useState, useEffect } from "react";
import { Save, FolderOpen, Trash2, Star, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { getTemplates, saveTemplate, deleteTemplate, BacktestTemplate } from "@/lib/templateService";
import { format } from "date-fns";

interface TemplateManagerProps {
  currentConfig: {
    symbol: string;
    symbolName: string;
    indicator: string;
    indicatorParams: Record<string, number>;
    timeframes: string[];
    initialCapital: string;
    positionSize: string;
    stopLoss: string;
    takeProfit: string;
  };
  onLoadTemplate: (template: BacktestTemplate) => void;
  lastResults?: {
    winRate: number;
    netProfit: number;
    profitFactor: number;
    totalTrades: number;
  };
}

export const TemplateManager = ({ currentConfig, onLoadTemplate, lastResults }: TemplateManagerProps) => {
  const [templates, setTemplates] = useState<BacktestTemplate[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    setTemplates(getTemplates());
    
    const handleUpdate = (e: CustomEvent) => {
      setTemplates(e.detail);
    };
    
    window.addEventListener("templatesUpdated", handleUpdate as EventListener);
    return () => window.removeEventListener("templatesUpdated", handleUpdate as EventListener);
  }, []);

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name.",
        variant: "destructive",
      });
      return;
    }

    if (templates.length >= 10) {
      toast({
        title: "Limit Reached",
        description: "You can save up to 10 templates. Delete some to save new ones.",
        variant: "destructive",
      });
      return;
    }

    const result = saveTemplate({
      name: templateName,
      symbol: currentConfig.symbol,
      symbolName: currentConfig.symbolName,
      indicator: currentConfig.indicator,
      indicatorParams: currentConfig.indicatorParams,
      timeframes: currentConfig.timeframes,
      initialCapital: currentConfig.initialCapital,
      positionSize: currentConfig.positionSize,
      stopLoss: currentConfig.stopLoss,
      takeProfit: currentConfig.takeProfit,
      lastResults,
    });

    if (result) {
      setTemplateName("");
      setSaveDialogOpen(false);
      toast({
        title: "Template Saved",
        description: `"${templateName}" has been saved successfully.`,
      });
    }
  };

  const handleDeleteTemplate = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete);
      setTemplateToDelete(null);
      setDeleteDialogOpen(false);
      toast({
        title: "Template Deleted",
        description: "Template has been removed.",
      });
    }
  };

  const handleLoadTemplate = (template: BacktestTemplate) => {
    onLoadTemplate(template);
    setLoadDialogOpen(false);
    toast({
      title: "Template Loaded",
      description: `"${template.name}" settings applied.`,
    });
  };

  return (
    <>
      <div className="flex gap-2">
        {/* Save Template Button */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              Save Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Save className="h-5 w-5 text-primary" />
                Save Template
              </DialogTitle>
              <DialogDescription>
                Save current settings as a template ({templates.length}/10 used)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  placeholder="e.g. RSI Scalping Strategy"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-sm">
                <p className="font-medium mb-2">Current Settings:</p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs">
                  <div>Symbol: <span className="text-foreground">{currentConfig.symbol}</span></div>
                  <div>Indicator: <span className="text-foreground">{currentConfig.indicator}</span></div>
                  <div>Timeframes: <span className="text-foreground">{currentConfig.timeframes.join(", ")}</span></div>
                  <div>Capital: <span className="text-foreground">${currentConfig.initialCapital}</span></div>
                </div>
              </div>

              {lastResults && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                  <p className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Last Backtest Results
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Win Rate: <span className="font-medium">{lastResults.winRate}%</span></div>
                    <div>Net Profit: <span className={cn("font-medium", lastResults.netProfit >= 0 ? "text-buy" : "text-sell")}>${lastResults.netProfit}</span></div>
                    <div>Profit Factor: <span className="font-medium">{lastResults.profitFactor}</span></div>
                    <div>Trades: <span className="font-medium">{lastResults.totalTrades}</span></div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} disabled={templates.length >= 10}>
                Save Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Load Template Button */}
        <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Load Template
              {templates.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-[1.25rem] p-0 flex items-center justify-center text-xs">
                  {templates.length}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                Load Template
              </DialogTitle>
              <DialogDescription>
                Select a saved template to apply its settings
              </DialogDescription>
            </DialogHeader>

            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No templates saved yet</p>
                <p className="text-xs mt-1">Save your first template to see it here</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[400px] pr-2">
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-secondary/30 transition-colors cursor-pointer group"
                      onClick={() => handleLoadTemplate(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-primary" />
                            <span className="font-medium">{template.name}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">{template.symbol}</Badge>
                            <Badge variant="outline" className="text-xs">{template.indicator}</Badge>
                            {template.timeframes.slice(0, 3).map(tf => (
                              <Badge key={tf} variant="secondary" className="text-xs">{tf}</Badge>
                            ))}
                            {template.timeframes.length > 3 && (
                              <Badge variant="secondary" className="text-xs">+{template.timeframes.length - 3}</Badge>
                            )}
                          </div>
                          {template.lastResults && (
                            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                              <span>Win: {template.lastResults.winRate}%</span>
                              <span className={template.lastResults.netProfit >= 0 ? "text-buy" : "text-sell"}>
                                P&L: ${template.lastResults.netProfit}
                              </span>
                            </div>
                          )}
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(template.updatedAt), "MMM dd, yyyy")}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTemplateToDelete(template.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
