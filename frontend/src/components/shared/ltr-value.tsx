import { cn } from "@/lib/utils";

interface LtrValueProps {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "div" | "p";
}

/** Isolates LTR content (emails, numbers, dates) inside RTL layouts. */
export function LtrValue({ children, className, as: Tag = "span" }: LtrValueProps) {
  return (
    <Tag dir="ltr" className={cn("inline-block text-start unicode-bidi-isolate", className)}>
      {children}
    </Tag>
  );
}
