import { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/states/empty-state";
import { EntityCardGrid } from "@/components/cards/entity-card-grid";

interface CardCollectionProps<T> {
  items: T[];
  keyExtractor: (item: T) => string | number;
  renderCard: (item: T) => React.ReactNode;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  columns?: "default" | "wide" | "compact";
}

export function CardCollection<T>({
  items,
  keyExtractor,
  renderCard,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  columns,
}: CardCollectionProps<T>) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <EntityCardGrid columns={columns}>
      {items.map((item) => (
        <div key={keyExtractor(item)} className="h-full">
          {renderCard(item)}
        </div>
      ))}
    </EntityCardGrid>
  );
}
