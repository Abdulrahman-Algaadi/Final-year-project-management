import { cn } from "@/lib/utils";

interface CardActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function CardActions({ children, className }: CardActionsProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-start gap-2", className)} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}
