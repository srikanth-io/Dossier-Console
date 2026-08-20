"use client";

import type { SVGAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

interface MonitorIconProps extends SVGAttributes<SVGSVGElement> {
  size?: number;
}

const MonitorIcon = forwardRef<SVGSVGElement, MonitorIconProps>(
  ({ className, size = 24, ...props }, ref) => (
    <svg
      className={cn(className)}
      ref={ref}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  )
);

MonitorIcon.displayName = "MonitorIcon";

export { MonitorIcon };
