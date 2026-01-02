// Copy Trading Service - Manage traders to follow and copy their trades

const TRADERS_KEY = "copy_trading_traders";
const FOLLOWING_KEY = "copy_trading_following";

export interface TopTrader {
  id: string;
  name: string;
  username: string;
  avatar: string;
  winRate: number;
  totalPnL: number;
  totalTrades: number;
  followers: number;
  monthlyReturn: number;
  riskLevel: "low" | "medium" | "high";
  tradingStyle: string;
  instruments: string[];
  isVerified: boolean;
}

export interface FollowedTrader extends TopTrader {
  followedAt: string;
  copyPercentage: number; // 1-100% of trade size to copy
  maxLossLimit: number; // Max loss before auto-stop
  autoCopy: boolean;
}

export interface CopiedTrade {
  id: string;
  traderId: string;
  traderName: string;
  symbol: string;
  type: "buy" | "sell";
  entryPrice: number;
  currentPrice: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  openedAt: string;
  status: "open" | "closed";
  closedAt?: string;
  closePrice?: number;
}

// Mock top traders data
const MOCK_TRADERS: TopTrader[] = [
  {
    id: "trader_1",
    name: "Alex Chen",
    username: "alex_trades",
    avatar: "AC",
    winRate: 78,
    totalPnL: 125340,
    totalTrades: 1247,
    followers: 3421,
    monthlyReturn: 12.5,
    riskLevel: "medium",
    tradingStyle: "Swing Trading",
    instruments: ["AAPL", "TSLA", "BTC/USD"],
    isVerified: true,
  },
  {
    id: "trader_2",
    name: "Sarah Miller",
    username: "sarah_fx",
    avatar: "SM",
    winRate: 82,
    totalPnL: 89750,
    totalTrades: 892,
    followers: 2156,
    monthlyReturn: 8.3,
    riskLevel: "low",
    tradingStyle: "Day Trading",
    instruments: ["EUR/USD", "GBP/USD", "USD/JPY"],
    isVerified: true,
  },
  {
    id: "trader_3",
    name: "Mike Johnson",
    username: "crypto_mike",
    avatar: "MJ",
    winRate: 71,
    totalPnL: 203890,
    totalTrades: 2341,
    followers: 5678,
    monthlyReturn: 18.7,
    riskLevel: "high",
    tradingStyle: "Scalping",
    instruments: ["BTC/USD", "ETH/USD", "SOL/USD"],
    isVerified: true,
  },
  {
    id: "trader_4",
    name: "Emma Wilson",
    username: "emma_stocks",
    avatar: "EW",
    winRate: 75,
    totalPnL: 67890,
    totalTrades: 567,
    followers: 1234,
    monthlyReturn: 9.2,
    riskLevel: "low",
    tradingStyle: "Position Trading",
    instruments: ["MSFT", "GOOGL", "AMZN"],
    isVerified: false,
  },
  {
    id: "trader_5",
    name: "David Park",
    username: "david_algo",
    avatar: "DP",
    winRate: 85,
    totalPnL: 156780,
    totalTrades: 3456,
    followers: 4321,
    monthlyReturn: 14.1,
    riskLevel: "medium",
    tradingStyle: "Algorithmic",
    instruments: ["SPY", "QQQ", "BTC/USD"],
    isVerified: true,
  },
];

export const getTopTraders = (): TopTrader[] => {
  return MOCK_TRADERS;
};

export const getFollowedTraders = (): FollowedTrader[] => {
  try {
    const stored = localStorage.getItem(FOLLOWING_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const followTrader = (
  trader: TopTrader,
  copyPercentage: number = 50,
  maxLossLimit: number = 500,
  autoCopy: boolean = true
): FollowedTrader => {
  const followed = getFollowedTraders();
  
  // Check if already following
  if (followed.find(t => t.id === trader.id)) {
    throw new Error("Already following this trader");
  }
  
  const newFollow: FollowedTrader = {
    ...trader,
    followedAt: new Date().toISOString(),
    copyPercentage,
    maxLossLimit,
    autoCopy,
  };
  
  followed.push(newFollow);
  localStorage.setItem(FOLLOWING_KEY, JSON.stringify(followed));
  window.dispatchEvent(new CustomEvent("followedTradersUpdated", { detail: followed }));
  
  return newFollow;
};

export const unfollowTrader = (traderId: string): boolean => {
  const followed = getFollowedTraders().filter(t => t.id !== traderId);
  localStorage.setItem(FOLLOWING_KEY, JSON.stringify(followed));
  window.dispatchEvent(new CustomEvent("followedTradersUpdated", { detail: followed }));
  return true;
};

export const updateFollowSettings = (
  traderId: string,
  settings: Partial<Pick<FollowedTrader, "copyPercentage" | "maxLossLimit" | "autoCopy">>
): FollowedTrader | null => {
  const followed = getFollowedTraders();
  const index = followed.findIndex(t => t.id === traderId);
  
  if (index === -1) return null;
  
  followed[index] = { ...followed[index], ...settings };
  localStorage.setItem(FOLLOWING_KEY, JSON.stringify(followed));
  window.dispatchEvent(new CustomEvent("followedTradersUpdated", { detail: followed }));
  
  return followed[index];
};

// Generate mock copied trades
export const getCopiedTrades = (): CopiedTrade[] => {
  const followed = getFollowedTraders();
  if (followed.length === 0) return [];
  
  // Generate some mock copied trades based on followed traders
  const mockTrades: CopiedTrade[] = [];
  
  followed.forEach(trader => {
    if (trader.autoCopy && trader.instruments.length > 0) {
      const symbol = trader.instruments[Math.floor(Math.random() * trader.instruments.length)];
      const entryPrice = Math.random() * 1000 + 100;
      const currentPrice = entryPrice * (1 + (Math.random() - 0.45) * 0.1);
      const type = Math.random() > 0.5 ? "buy" : "sell";
      const pnl = type === "buy" ? currentPrice - entryPrice : entryPrice - currentPrice;
      const pnlPercent = (pnl / entryPrice) * 100;
      
      mockTrades.push({
        id: `copy_${trader.id}_${Date.now()}`,
        traderId: trader.id,
        traderName: trader.name,
        symbol,
        type,
        entryPrice,
        currentPrice,
        size: 0.1 * (trader.copyPercentage / 100),
        pnl: pnl * 100,
        pnlPercent,
        openedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        status: "open",
      });
    }
  });
  
  return mockTrades;
};
