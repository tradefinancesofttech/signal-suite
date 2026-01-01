// Centralized trade service for syncing trades across the app
import { OpenPosition } from "@/components/dashboard/FloatingPortfolio";

const POSITIONS_KEY = "openPositions";
const TRADE_HISTORY_KEY = "tradeHistory";
const PNL_ALERTS_KEY = "pnlAlerts";

export interface TradeHistoryItem {
  id: string;
  symbol: string;
  name: string;
  type: "buy" | "sell";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryTime: string;
  exitTime: string;
  pnl: number;
  pnlPercent: number;
  accountType: "paper" | "live";
  indicator?: string;
  timeframes?: string[];
}

export interface PnLAlert {
  id: string;
  type: "profit" | "loss" | "percent";
  threshold: number;
  enabled: boolean;
  symbol?: string; // Optional: specific symbol, or all if empty
  createdAt: string;
}

// Get open positions
export const getOpenPositions = (): OpenPosition[] => {
  try {
    const stored = localStorage.getItem(POSITIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save open positions
export const saveOpenPositions = (positions: OpenPosition[]) => {
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
  window.dispatchEvent(new CustomEvent("positionsUpdated", { detail: positions }));
};

// Add new position
export const addPosition = (position: Omit<OpenPosition, "id">): OpenPosition => {
  const positions = getOpenPositions();
  const newPosition: OpenPosition = {
    ...position,
    id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  positions.push(newPosition);
  saveOpenPositions(positions);
  return newPosition;
};

// Close position and move to history
export const closePosition = (positionId: string, exitPrice: number): TradeHistoryItem | null => {
  const positions = getOpenPositions();
  const position = positions.find(p => p.id === positionId);
  
  if (!position) return null;
  
  const pnl = position.type === "buy" 
    ? (exitPrice - position.entryPrice) * position.quantity 
    : (position.entryPrice - exitPrice) * position.quantity;
  const pnlPercent = (pnl / (position.entryPrice * position.quantity)) * 100;
  
  const historyItem: TradeHistoryItem = {
    id: `trade_${Date.now()}`,
    symbol: position.symbol,
    name: position.name,
    type: position.type,
    entryPrice: position.entryPrice,
    exitPrice,
    quantity: position.quantity,
    entryTime: position.entryTime,
    exitTime: new Date().toISOString(),
    pnl: Number(pnl.toFixed(2)),
    pnlPercent: Number(pnlPercent.toFixed(2)),
    accountType: "paper", // Default, can be enhanced
  };
  
  // Add to history
  addToHistory(historyItem);
  
  // Remove from positions
  const updatedPositions = positions.filter(p => p.id !== positionId);
  saveOpenPositions(updatedPositions);
  
  return historyItem;
};

// Trade History
export const getTradeHistory = (): TradeHistoryItem[] => {
  try {
    const stored = localStorage.getItem(TRADE_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addToHistory = (trade: TradeHistoryItem) => {
  const history = getTradeHistory();
  history.unshift(trade);
  localStorage.setItem(TRADE_HISTORY_KEY, JSON.stringify(history));
  window.dispatchEvent(new CustomEvent("tradeHistoryUpdated", { detail: history }));
};

export const clearTradeHistory = () => {
  localStorage.setItem(TRADE_HISTORY_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent("tradeHistoryUpdated", { detail: [] }));
};

// P&L Alerts
export const getPnLAlerts = (): PnLAlert[] => {
  try {
    const stored = localStorage.getItem(PNL_ALERTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const savePnLAlerts = (alerts: PnLAlert[]) => {
  localStorage.setItem(PNL_ALERTS_KEY, JSON.stringify(alerts));
};

export const addPnLAlert = (alert: Omit<PnLAlert, "id" | "createdAt">): PnLAlert => {
  const alerts = getPnLAlerts();
  const newAlert: PnLAlert = {
    ...alert,
    id: `alert_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  alerts.push(newAlert);
  savePnLAlerts(alerts);
  return newAlert;
};

export const deletePnLAlert = (alertId: string) => {
  const alerts = getPnLAlerts().filter(a => a.id !== alertId);
  savePnLAlerts(alerts);
};

export const togglePnLAlert = (alertId: string) => {
  const alerts = getPnLAlerts().map(a => 
    a.id === alertId ? { ...a, enabled: !a.enabled } : a
  );
  savePnLAlerts(alerts);
};

// Check P&L alerts against current positions
export const checkPnLAlerts = (totalPnl: number, positions: OpenPosition[]): PnLAlert[] => {
  const alerts = getPnLAlerts().filter(a => a.enabled);
  const triggeredAlerts: PnLAlert[] = [];
  
  alerts.forEach(alert => {
    if (alert.symbol) {
      // Check specific symbol
      const position = positions.find(p => p.symbol === alert.symbol);
      if (position) {
        if (alert.type === "profit" && position.pnl >= alert.threshold) {
          triggeredAlerts.push(alert);
        } else if (alert.type === "loss" && position.pnl <= -alert.threshold) {
          triggeredAlerts.push(alert);
        } else if (alert.type === "percent" && Math.abs(position.pnlPercent) >= alert.threshold) {
          triggeredAlerts.push(alert);
        }
      }
    } else {
      // Check total P&L
      if (alert.type === "profit" && totalPnl >= alert.threshold) {
        triggeredAlerts.push(alert);
      } else if (alert.type === "loss" && totalPnl <= -alert.threshold) {
        triggeredAlerts.push(alert);
      }
    }
  });
  
  return triggeredAlerts;
};
