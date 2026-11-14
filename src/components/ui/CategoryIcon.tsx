import { Broom, Drop, Lightning, Snowflake } from "@phosphor-icons/react/dist/ssr";
import type { CategoryId } from "@/config/booking";

const ICONS = { ac: Snowflake, electrical: Lightning, plumbing: Drop, cleaning: Broom } as const;

/** One icon per service category, from one family (Phosphor). Decorative: the category name is always written next to it. */
export function CategoryIcon({ category, className }: { category: CategoryId; className?: string }) {
  const Icon = ICONS[category];
  return <Icon aria-hidden="true" className={className ?? "size-5 xl1:size-6 xl3:size-7"} weight="duotone" />;
}
