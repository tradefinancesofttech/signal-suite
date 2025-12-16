import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings2 } from "lucide-react";

export interface IndicatorParamsData {
  [key: string]: number | string;
}

interface IndicatorParamsProps {
  indicator: string;
  params: IndicatorParamsData;
  onChange: (params: IndicatorParamsData) => void;
}

const DEFAULT_PARAMS: Record<string, IndicatorParamsData> = {
  RSI: { period: 14, overbought: 70, oversold: 30 },
  MACD: { fast: 12, slow: 26, signal: 9 },
  EMA: { period: 20 },
  SMA: { period: 20 },
  Bollinger: { period: 20, stdDev: 2 },
  Stochastic: { kPeriod: 14, dPeriod: 3, smooth: 3 },
  ADX: { period: 14 },
  ATR: { period: 14 },
  CCI: { period: 20 },
  "Williams %R": { period: 14 },
};

export const getDefaultParams = (indicator: string): IndicatorParamsData => {
  return DEFAULT_PARAMS[indicator] || { period: 14 };
};

export const IndicatorParams = ({ indicator, params, onChange }: IndicatorParamsProps) => {
  const [localParams, setLocalParams] = useState<IndicatorParamsData>(params);

  const handleChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    const newParams = { ...localParams, [key]: isNaN(numValue) ? value : numValue };
    setLocalParams(newParams);
    onChange(newParams);
  };

  const paramLabels: Record<string, string> = {
    period: "Period",
    overbought: "Overbought",
    oversold: "Oversold",
    fast: "Fast",
    slow: "Slow",
    signal: "Signal",
    stdDev: "Std Dev",
    kPeriod: "K Period",
    dPeriod: "D Period",
    smooth: "Smooth",
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs bg-secondary/50 border border-border/50 hover:bg-secondary"
        >
          <Settings2 className="h-3 w-3 mr-1" />
          {Object.entries(params).slice(0, 2).map(([k, v]) => `${v}`).join("/")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 bg-card border-border" align="start">
        <div className="space-y-3">
          <div className="text-xs font-medium text-foreground">{indicator} Parameters</div>
          {Object.entries(localParams).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground w-20">
                {paramLabels[key] || key}
              </label>
              <Input
                type="number"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className="h-7 text-xs bg-secondary/50"
              />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
