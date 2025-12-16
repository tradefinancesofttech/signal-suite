import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, ChevronDown, ChevronRight } from "lucide-react";
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
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    us_stocks: true,
    crypto: true,
    forex: true,
  });

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

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const expandAll = () => {
    setExpandedCategories({
      us_stocks: true,
      crypto: true,
      forex: true,
    });
  };

  const collapseAll = () => {
    setExpandedCategories({
      us_stocks: false,
      crypto: false,
      forex: false,
    });
  };

  const allExpanded = Object.values(expandedCategories).every(Boolean);

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
          <div className="flex justify-end px-2 py-1 border-b border-border">
            <button
              type="button"
              onClick={allExpanded ? collapseAll : expandAll}
              className="text-xs text-primary hover:underline"
            >
              {allExpanded ? "Hide All" : "View All"}
            </button>
          </div>
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No instrument found.</CommandEmpty>
            {Object.entries(groupedInstruments).map(([category, items]) =>
              items.length > 0 ? (
                <CommandGroup key={category}>
                  <div
                    className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-secondary/50"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-1">
                      {expandedCategories[category] ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-xs font-semibold text-muted-foreground">
                        {categoryLabels[category as keyof typeof categoryLabels]}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{items.length}</span>
                  </div>
                  {expandedCategories[category] &&
                    items.map((instrument) => (
                      <CommandItem
                        key={instrument.symbol}
                        value={instrument.symbol}
                        onSelect={() => {
                          onSelect(instrument);
                          setOpen(false);
                          setSearch("");
                        }}
                        className="flex items-center justify-between ml-4"
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
