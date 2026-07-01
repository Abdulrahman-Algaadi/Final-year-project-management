"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  );
}

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  placeholder?: string;
  filters?: React.ReactNode;
  onFilterClick?: () => void;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  placeholder = "Search...",
  filters,
  onFilterClick,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="ps-9"
          aria-label="Search"
        />
      </div>
      {filters}
      {onFilterClick && (
        <Button variant="outline" size="sm" className="gap-2 sm:hidden" onClick={onFilterClick}>
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      )}
    </div>
  );
}
