import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => (
    <div className="w-full">
      <select
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  ),
);
Select.displayName = "Select";

export { Select };
