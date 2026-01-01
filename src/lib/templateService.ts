// Template service for saving/loading backtest configurations

const TEMPLATES_KEY = "backtest_templates";
const MAX_TEMPLATES = 10;

export interface BacktestTemplate {
  id: string;
  name: string;
  symbol: string;
  symbolName: string;
  indicator: string;
  indicatorParams: Record<string, number>;
  timeframes: string[];
  initialCapital: string;
  positionSize: string;
  stopLoss: string;
  takeProfit: string;
  createdAt: string;
  updatedAt: string;
  // Results from last backtest
  lastResults?: {
    winRate: number;
    netProfit: number;
    profitFactor: number;
    totalTrades: number;
  };
}

export const getTemplates = (): BacktestTemplate[] => {
  try {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveTemplate = (template: Omit<BacktestTemplate, "id" | "createdAt" | "updatedAt">): BacktestTemplate | null => {
  const templates = getTemplates();
  
  if (templates.length >= MAX_TEMPLATES) {
    return null; // Max templates reached
  }
  
  const newTemplate: BacktestTemplate = {
    ...template,
    id: `template_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  templates.push(newTemplate);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  window.dispatchEvent(new CustomEvent("templatesUpdated", { detail: templates }));
  
  return newTemplate;
};

export const updateTemplate = (templateId: string, updates: Partial<BacktestTemplate>): BacktestTemplate | null => {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === templateId);
  
  if (index === -1) return null;
  
  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  window.dispatchEvent(new CustomEvent("templatesUpdated", { detail: templates }));
  
  return templates[index];
};

export const deleteTemplate = (templateId: string): boolean => {
  const templates = getTemplates().filter(t => t.id !== templateId);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  window.dispatchEvent(new CustomEvent("templatesUpdated", { detail: templates }));
  return true;
};

export const getTemplateById = (templateId: string): BacktestTemplate | null => {
  return getTemplates().find(t => t.id === templateId) || null;
};
