import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeframeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  excludeTimeframes?: string[];
}

const ALL_TIMEFRAMES = [
  { value: "30s", label: "30s" },
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "30m", label: "30m" },
  { value: "1h", label: "1h" },
  { value: "4h", label: "4h" },
  { value: "1d", label: "1d" },
];

export const TimeframeSelector = ({ value, onChange, excludeTimeframes = [] }: TimeframeSelectorProps) => {
  const availableTimeframes = ALL_TIMEFRAMES.filter(
    (tf) => !excludeTimeframes.includes(tf.value) || tf.value === value
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[70px] h-7 text-xs bg-secondary/50 border-border/50">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-card border-border z-50">
        {availableTimeframes.map((tf) => (
          <SelectItem key={tf.value} value={tf.value} className="text-xs">
            {tf.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const DEFAULT_TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "1d"];
export { ALL_TIMEFRAMES };
