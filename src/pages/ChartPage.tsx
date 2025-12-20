import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

declare global {
  interface Window {
    TradingView: any;
  }
}

const ChartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  const { symbol = "AAPL", name = "Apple Inc." } = location.state || {};

  // Convert symbol to TradingView format
  const getTradingViewSymbol = (sym: string): string => {
    // Crypto pairs
    if (sym.includes("/")) {
      const [base, quote] = sym.split("/");
      if (quote === "USD") {
        return `BINANCE:${base}USDT`;
      }
      return `FX:${base}${quote}`;
    }
    // US Stocks
    return `NASDAQ:${sym}`;
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (containerRef.current && window.TradingView) {
        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol: getTradingViewSymbol(symbol),
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0a0a0a",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tradingview_chart",
          hide_side_toolbar: false,
          studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies"],
          save_image: true,
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol]);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">{symbol}</h1>
            <p className="text-xs text-muted-foreground">{name} - TradingView Chart</p>
          </div>
        </div>
      </header>

      {/* Chart Container - Full remaining height */}
      <div className="flex-1 p-2">
        <div
          id="tradingview_chart"
          ref={containerRef}
          className="w-full h-full rounded-lg overflow-hidden border border-border/50"
        />
      </div>
    </div>
  );
};

export default ChartPage;
