"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  mobileLabel?: string;
}

interface ResponsiveDataListProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function ResponsiveDataList<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = "No records found",
}: ResponsiveDataListProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={cn("px-4 py-3 text-left font-medium", col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    "border-t border-border transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/30",
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3", col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {data.map((row) => (
          <Card
            key={keyExtractor(row)}
            className={cn(onRowClick && "cursor-pointer active:scale-[0.99]")}
            onClick={() => onRowClick?.(row)}
          >
            <CardContent className="space-y-2 p-4">
              {columns.map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{col.mobileLabel ?? col.header}</span>
                  <span className="text-right font-medium">{col.cell(row)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
