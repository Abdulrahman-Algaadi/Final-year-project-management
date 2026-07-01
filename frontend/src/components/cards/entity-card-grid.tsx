import { cn } from "@/lib/utils";

interface EntityCardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: "default" | "wide" | "compact";
}

const columnClass: Record<NonNullable<EntityCardGridProps["columns"]>, string> = {
  default: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
  wide: "grid-cols-1 lg:grid-cols-2",
  compact: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

export function EntityCardGrid({ children, className, columns = "default" }: EntityCardGridProps) {
  return (
    <div className={cn("grid gap-4", columnClass[columns], className)} role="list">
      {children}
    </div>
  );
}
