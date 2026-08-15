"use client"

import type { ReactNode, SVGAttributes } from "react"

import { cn } from "@/lib/utils"

interface StudioIconProps extends SVGAttributes<SVGSVGElement> {
  size?: number
}

function makeIcon(displayName: string, paths: ReactNode) {
  function StudioIcon({
    className,
    size = 24,
    ...props
  }: StudioIconProps) {
    return (
      <svg
        className={cn(className)}
        {...props}
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths}
      </svg>
    )
  }
  StudioIcon.displayName = displayName
  return StudioIcon
}

export const TypeIcon = makeIcon("TypeIcon", (
  <>
    <path d="M4 7V5h16v2" />
    <path d="M12 5v14" />
    <path d="M9 19h6" />
  </>
))

export const HeadingIcon = makeIcon("HeadingIcon", (
  <>
    <path d="M5 4v16" />
    <path d="M19 4v16" />
    <path d="M5 12h14" />
  </>
))

export const ImageIcon = makeIcon("ImageIcon", (
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </>
))

export const ShapeIcon = makeIcon("ShapeIcon", (
  <>
    <rect x="3" y="3" width="12" height="12" rx="2" />
    <circle cx="16.5" cy="16.5" r="4" />
  </>
))

export const DividerIcon = makeIcon("DividerIcon", (
  <>
    <path d="M4 12h16" />
    <path d="M9 7l3-3 3 3" />
    <path d="M9 17l3 3 3-3" />
  </>
))

export const ContainerIcon = makeIcon("ContainerIcon", (
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <rect x="8" y="9" width="8" height="6" rx="1" />
  </>
))

export const HeaderIcon = makeIcon("HeaderIcon", (
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 9h18" />
  </>
))

export const FooterIcon = makeIcon("FooterIcon", (
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 15h18" />
  </>
))

export const PageNumberIcon = makeIcon("PageNumberIcon", (
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 5v14" />
    <path d="M13 12h4" />
  </>
))

export const TableIcon = makeIcon("TableIcon", (
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
    <path d="M3 15h18" />
    <path d="M9 4v16" />
    <path d="M15 4v16" />
  </>
))

export const ChartIcon = makeIcon("ChartIcon", (
  <>
    <path d="M4 20V4" />
    <path d="M20 20H4" />
    <path d="M7 16v-4" />
    <path d="M12 16V8" />
    <path d="M17 16v-6" />
  </>
))

export const ProgressIcon = makeIcon("ProgressIcon", (
  <>
    <rect x="3" y="9" width="18" height="6" rx="3" />
    <rect x="5" y="11" width="10" height="2" rx="1" />
    <path d="m16 6 3-3 3 3" />
    <path d="M19 3v6" />
  </>
))

export const CalloutIcon = makeIcon("CalloutIcon", (
  <>
    <path d="M21 11.5a8.38 8.38 0 0 1-9 8.35 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2a8.5 8.5 0 1 1 16.1-4.3Z" />
    <path d="M8 11h8" />
    <path d="M8 15h5" />
  </>
))

export const ListIcon = makeIcon("ListIcon", (
  <>
    <path d="M9 6h12" />
    <path d="M9 12h12" />
    <path d="M9 18h12" />
    <circle cx="4.5" cy="6" r="0.5" />
    <circle cx="4.5" cy="12" r="0.5" />
    <circle cx="4.5" cy="18" r="0.5" />
  </>
))

export const ChecklistIcon = makeIcon("ChecklistIcon", (
  <>
    <rect x="4" y="3" width="4" height="4" rx="1" />
    <rect x="4" y="10" width="4" height="4" rx="1" />
    <rect x="4" y="17" width="4" height="4" rx="1" />
    <path d="m7 5 .8.8L9.5 4" />
    <path d="m7 12 .8.8 1.7-1.8" />
    <path d="M11 5h9" />
    <path d="M11 12h9" />
    <path d="M11 19h9" />
  </>
))

export const CodeIcon = makeIcon("CodeIcon", (
  <>
    <path d="m16 18 6-6-6-6" />
    <path d="m8 6-6 6 6 6" />
  </>
))

export const LinkIcon = makeIcon("LinkIcon", (
  <>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </>
))

export const SeverityIcon = makeIcon("SeverityIcon", (
  <>
    <path d="M12 3l8 3v5c0 4.5-3.2 8.3-8 9.5-4.8-1.2-8-5-8-9.5V6Z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </>
))

export const FindingIcon = makeIcon("FindingIcon", (
  <>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
    <circle cx="8" cy="13.5" r="0.5" />
  </>
))

export const EvidenceIcon = makeIcon("EvidenceIcon", (
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
    <path d="M8 11h6" />
  </>
))

export const ApiIcon = makeIcon("ApiIcon", (
  <>
    <path d="m6 9-3 3 3 3" />
    <path d="m18 9 3 3-3 3" />
    <path d="M13 6l-2 12" />
  </>
))

export const TestCaseIcon = makeIcon("TestCaseIcon", (
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
    <path d="M3 15h18" />
    <path d="M9 4v16" />
    <path d="m14.5 13.5 1.5 1.5 3-3" />
  </>
))

export const EduBoxIcon = makeIcon("EduBoxIcon", (
  <>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    <path d="M9 7h7" />
  </>
))

export const BadgeIcon = makeIcon("BadgeIcon", (
  <>
    <circle cx="12" cy="8" r="5" />
    <path d="m8.6 12.3-1.6 8.7 5-3 5 3-1.6-8.7" />
  </>
))

export const EmbedIcon = makeIcon("EmbedIcon", (
  <>
    <path d="M14 3v5h5" />
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="m9 14 2 2-2 2" />
    <path d="m13 14-2 2 2 2" />
  </>
))

export const LayersIcon = makeIcon("LayersIcon", (
  <>
    <path d="m12 2 9 5-9 5-9-5Z" />
    <path d="m3 12 9 5 9-5" />
    <path d="m3 17 9 5 9-5" />
  </>
))

export const VariablesIcon = makeIcon("VariablesIcon", (
  <>
    <path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1" />
    <path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1" />
  </>
))

export const ZoomInIcon = makeIcon("ZoomInIcon", (
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
    <path d="M11 8v6" />
    <path d="M8 11h6" />
  </>
))

export const ZoomOutIcon = makeIcon("ZoomOutIcon", (
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
    <path d="M8 11h6" />
  </>
))

export const FitIcon = makeIcon("FitIcon", (
  <>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <rect x="8" y="8" width="8" height="8" rx="1" />
  </>
))

export const GridIcon = makeIcon("GridIcon", (
  <>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 9h16" />
    <path d="M4 15h16" />
    <path d="M9 4v16" />
    <path d="M15 4v16" />
  </>
))

export const RotateIcon = makeIcon("RotateIcon", (
  <>
    <path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.9 1 6.6 2.6L21 8" />
    <path d="M21 3v5h-5" />
  </>
))

export const DuplicateIcon = makeIcon("DuplicateIcon", (
  <>
    <rect x="8" y="8" width="13" height="13" rx="2" />
    <path d="M5 16H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
  </>
))

export const AddPageIcon = makeIcon("AddPageIcon", (
  <>
    <path d="M14 3v5h5" />
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M12 11v6" />
    <path d="M9 14h6" />
  </>
))

export const ExportIcon = makeIcon("ExportIcon", (
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M12 4v12" />
  </>
))

export const MoreVerticalIcon = makeIcon("MoreVerticalIcon", (
  <>
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </>
))

export const AlignLeftIcon = makeIcon("AlignLeftIcon", (
  <>
    <path d="M8 6h12" />
    <path d="M8 12h12" />
    <path d="M8 18h12" />
    <path d="M4 6h.01" />
    <path d="M4 12h.01" />
    <path d="M4 18h.01" />
  </>
))

export const AlignCenterIcon = makeIcon("AlignCenterIcon", (
  <>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
    <path d="M12 3v.01" />
    <path d="M12 9v.01" />
    <path d="M12 15v.01" />
    <path d="M12 21v.01" />
  </>
))

export const AlignRightIcon = makeIcon("AlignRightIcon", (
  <>
    <path d="M4 6h12" />
    <path d="M4 12h12" />
    <path d="M4 18h12" />
    <path d="M20 6h.01" />
    <path d="M20 12h.01" />
    <path d="M20 18h.01" />
  </>
))

export const AlignTopIcon = makeIcon("AlignTopIcon", (
  <>
    <path d="M6 4h12" />
    <path d="M6 8h12" />
    <path d="M6 12h12" />
    <path d="M6 16h12" />
    <path d="M6 20h12" />
    <path d="M3 4h.01" />
    <path d="M9 4h.01" />
    <path d="M15 4h.01" />
    <path d="M21 4h.01" />
  </>
))

export const AlignMiddleIcon = makeIcon("AlignMiddleIcon", (
  <>
    <path d="M6 4h12" />
    <path d="M6 8h12" />
    <path d="M6 12h12" />
    <path d="M6 16h12" />
    <path d="M6 20h12" />
    <path d="M3 12h.01" />
    <path d="M9 12h.01" />
    <path d="M15 12h.01" />
    <path d="M21 12h.01" />
  </>
))

export const AlignBottomIcon = makeIcon("AlignBottomIcon", (
  <>
    <path d="M6 4h12" />
    <path d="M6 8h12" />
    <path d="M6 12h12" />
    <path d="M6 16h12" />
    <path d="M6 20h12" />
    <path d="M3 20h.01" />
    <path d="M9 20h.01" />
    <path d="M15 20h.01" />
    <path d="M21 20h.01" />
  </>
))

export const DistributeHorizontalIcon = makeIcon("DistributeHorizontalIcon", (
  <>
    <path d="M4 12h16" />
    <path d="M9 5v14" />
    <path d="M15 5v14" />
    <path d="M2 4v16" />
    <path d="M22 4v16" />
  </>
))

export const DistributeVerticalIcon = makeIcon("DistributeVerticalIcon", (
  <>
    <path d="M12 4v16" />
    <path d="M5 9h14" />
    <path d="M5 15h14" />
    <path d="M4 2h16" />
    <path d="M4 22h16" />
  </>
))

export const BringToFrontIcon = makeIcon("BringToFrontIcon", (
  <>
    <rect x="3" y="3" width="11" height="11" rx="2" />
    <path d="M7 13v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-5" />
  </>
))

export const SendToBackIcon = makeIcon("SendToBackIcon", (
  <>
    <rect x="10" y="10" width="11" height="11" rx="2" />
    <path d="M17 7v3H9a2 2 0 0 0-2 2v8H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2Z" />
  </>
))

export const PasteIcon = makeIcon("PasteIcon", (
  <>
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6" />
    <path d="M9 16h4" />
  </>
))

export const PageIcon = makeIcon("PageIcon", (
  <>
    <path d="M14 3v5h5" />
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
  </>
))
