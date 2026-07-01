"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, change, trend, icon: Icon, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-4 text-primary" aria-hidden />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</div>
          {change && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              {trend === "up" && <TrendingUp className="size-3 text-success" />}
              {trend === "down" && <TrendingDown className="size-3 text-destructive" />}
              {change}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
