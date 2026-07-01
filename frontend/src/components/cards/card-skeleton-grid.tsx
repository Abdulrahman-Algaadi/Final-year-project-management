import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityCardGrid } from "@/components/cards/entity-card-grid";

export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <EntityCardGrid aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="h-full border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </CardContent>
          <CardFooter className="border-t border-border/50 bg-muted/20 px-4 py-3">
            <Skeleton className="ms-auto h-8 w-24" />
          </CardFooter>
        </Card>
      ))}
    </EntityCardGrid>
  );
}
