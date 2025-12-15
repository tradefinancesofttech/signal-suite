import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Instrument {
  symbol: string;
  name: string;
  category: "us_stocks" | "crypto" | "forex";
  price: number;
  change: number;
  changePercent: number;
}

interface InstrumentSearchProps {
  value: string;
  instruments: Instrument[];
  onSelect: (instrument: Instrument) => void;
}

const categoryLabels = {
  us_stocks: "US Stocks",
  crypto: "Cryptocurrency",
  forex: "Forex / Currency",
};

export const InstrumentSearch = ({ value, instruments, onSelect }: InstrumentSearchProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedInstrument = instruments.find((i) => i.symbol === value);

  const filteredInstruments = useMemo(() => {
    if (!search) return instruments;
    const lower = search.toLowerCase();
    return instruments.filter(
      (i) =>
        i.symbol.toLowerCase().includes(lower) ||
        i.name.toLowerCase().includes(lower)
    );
  }, [instruments, search]);

  const groupedInstruments = useMemo(() => {
    const groups: Record<string, Instrument[]> = {
      us_stocks: [],
      crypto: [],
      forex: [],
    };
    filteredInstruments.forEach((i) => {
      groups[i.category].push(i);
    });
    return groups;
  }, [filteredInstruments]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between bg-secondary/50 border-border/50 hover:bg-secondary"
        >
          {selectedInstrument ? (
            <span className="truncate font-semibold">{selectedInstrument.symbol}</span>
          ) : (
            <span className="text-muted-foreground">Select instrument...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-card border-border z-50" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search instruments..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No instrument found.</CommandEmpty>
            {Object.entries(groupedInstruments).map(([category, items]) =>
              items.length > 0 ? (
                <CommandGroup key={category} heading={categoryLabels[category as keyof typeof categoryLabels]}>
                  {items.map((instrument) => (
                    <CommandItem
                      key={instrument.symbol}
                      value={instrument.symbol}
                      onSelect={() => {
                        onSelect(instrument);
                        setOpen(false);
                        setSearch("");
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Check
                          className={cn(
                            "h-4 w-4",
                            value === instrument.symbol ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div>
                          <span className="font-semibold">{instrument.symbol}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{instrument.name}</span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
