import { cn } from "@/lib/utils";
import { LtrValue } from "@/components/shared/ltr-value";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  /** Use for emails, numbers, dates, and codes in RTL mode. */
  ltr?: boolean;
}

export function InfoRow({ label, value, icon, className, ltr }: InfoRowProps) {
  return (
    <div className={cn("space-y-1 text-sm", className)}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon && <span className="shrink-0 opacity-80">{icon}</span>}
        <span>{label}</span>
      </div>
      {ltr ? (
        <LtrValue className="block font-medium text-foreground">{value}</LtrValue>
      ) : (
        <div className="font-medium text-foreground">{value}</div>
      )}
    </div>
  );
}
