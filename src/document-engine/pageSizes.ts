import type { Orientation, PageSizeId } from "@/document-engine/types"

export const PAGE_SIZES: Record<PageSizeId, { width: number; height: number }> = {
  a4: { width: 794, height: 1123 },
  a3: { width: 1123, height: 1587 },
  a5: { width: 559, height: 794 },
  letter: { width: 816, height: 1056 },
  legal: { width: 816, height: 1344 },
  custom: { width: 794, height: 1123 },
}

export const PAGE_SIZE_LABELS: Record<PageSizeId, string> = {
  a4: "A4",
  a3: "A3",
  a5: "A5",
  letter: "Letter",
  legal: "Legal",
  custom: "Custom",
}

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  portrait: "Portrait",
  landscape: "Landscape",
}

export function sizedPage(
  sizeId: PageSizeId,
  orientation: Orientation
): { width: number; height: number } {
  const base = PAGE_SIZES[sizeId]
  if (orientation === "landscape" && base.width < base.height) {
    return { width: base.height, height: base.width }
  }
  if (orientation === "portrait" && base.width > base.height) {
    return { width: base.height, height: base.width }
  }
  return { ...base }
}
