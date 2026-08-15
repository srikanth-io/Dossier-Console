import type { VariantProps } from "class-variance-authority"

import { statusLabels } from "@/constants/messages/common"
import { badgeVariants } from "@/components/ui/badge"

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

const statusToVariant: Record<string, BadgeVariant> = {
  [statusLabels.complete]: "default",
  [statusLabels.active]: "default",
  [statusLabels.inReview]: "secondary",
  [statusLabels.invited]: "secondary",
  [statusLabels.draft]: "outline",
  [statusLabels.suspended]: "destructive",
}

export function getStatusBadgeVariant(status: string): BadgeVariant {
  return statusToVariant[status] ?? "secondary"
}
