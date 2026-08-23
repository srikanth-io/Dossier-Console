"use client";

import type { SVGAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface CalendarIconProps extends SVGAttributes<SVGSVGElement> {
  size?: number;
}

const CalendarIcon = forwardRef<SVGSVGElement, CalendarIconProps>(
  ({ className, size = 24, ...props }, ref) => {
    return (
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
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M12 18h.01" />
        <path d="M16 18h.01" />
      </svg>
    );
  }
);

CalendarIcon.displayName = "CalendarIcon";

export { CalendarIcon };
