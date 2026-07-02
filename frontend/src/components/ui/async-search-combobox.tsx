"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ComboboxOption } from "@/components/ui/combobox";

export type AsyncSearchResult = {
  options: ComboboxOption[];
  hasMore: boolean;
};

export type AsyncSearchFn = (query: string, page: number) => Promise<AsyncSearchResult>;

interface AsyncSearchComboboxProps {
  value?: string;
  onValueChange: (value: string, label?: string) => void;
  onSearch: AsyncSearchFn;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadMoreLabel?: string;
  searchingLabel?: string;
  /** Shown when value is set but the option is not in the current result page. */
  selectedLabel?: string;
  className?: string;
  disabled?: boolean;
  debounceMs?: number;
}

export function AsyncSearchCombobox({
  value,
  onValueChange,
  onSearch,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  loadMoreLabel = "Load more",
  searchingLabel = "Searching...",
  selectedLabel,
  className,
  disabled,
  debounceMs = 300,
}: AsyncSearchComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [options, setOptions] = React.useState<ComboboxOption[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [pickedLabel, setPickedLabel] = React.useState<string | undefined>(selectedLabel);

  const requestId = React.useRef(0);

  React.useEffect(() => {
    setPickedLabel(selectedLabel);
  }, [selectedLabel]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), debounceMs);
    return () => window.clearTimeout(timer);
  }, [query, debounceMs]);

  const runSearch = React.useCallback(
    async (searchQuery: string, nextPage: number, append: boolean) => {
      const id = ++requestId.current;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await onSearch(searchQuery, nextPage);
        if (id !== requestId.current) return;

        setOptions((prev) => (append ? [...prev, ...result.options] : result.options));
        setHasMore(result.hasMore);
        setPage(nextPage);
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [onSearch],
  );

  React.useEffect(() => {
    if (!open) return;
    void runSearch(debouncedQuery, 1, false);
  }, [open, debouncedQuery, runSearch]);

  const selected = options.find((option) => option.value === value);
  const displayLabel = selected?.label ?? pickedLabel;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setQuery("");
          setDebouncedQuery("");
          setOptions([]);
          setPage(1);
          setHasMore(false);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !displayLabel && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{displayLabel ?? placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="border-b border-border p-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9"
            autoFocus
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {loading && options.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {searchingLabel}
            </div>
          ) : options.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-sm hover:bg-accent hover:text-accent-foreground",
                  value === option.value && "bg-accent/60",
                )}
                onClick={() => {
                  onValueChange(option.value, option.label);
                  setPickedLabel(option.label);
                  setOpen(false);
                  setQuery("");
                  setDebouncedQuery("");
                }}
              >
                <Check
                  className={cn("size-4 shrink-0", value === option.value ? "opacity-100" : "opacity-0")}
                />
                <span className="truncate">{option.label}</span>
              </button>
            ))
          )}
        </div>
        {hasMore && (
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              disabled={loadingMore}
              onClick={() => void runSearch(debouncedQuery, page + 1, true)}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {searchingLabel}
                </>
              ) : (
                loadMoreLabel
              )}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
