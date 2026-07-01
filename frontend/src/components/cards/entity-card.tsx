"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EntityCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  bodyClassName?: string;
}

export function EntityCard({
  children,
  className,
  onClick,
  footer,
  header,
  bodyClassName,
}: EntityCardProps) {
  return (
    <Card
      role="listitem"
      className={cn(
        "group flex h-full flex-col overflow-hidden border-border/60 bg-card/90 shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-md",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {header && <CardHeader className="space-y-0 border-b border-border/50 pb-4">{header}</CardHeader>}
      <CardContent className={cn("flex flex-1 flex-col gap-3 p-4 sm:p-5", bodyClassName)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="mt-auto border-t border-border/50 bg-muted/20 px-4 py-3 sm:px-5">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
