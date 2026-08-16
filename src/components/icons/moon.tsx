"use client";

import type { SVGAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

interface MoonIconProps extends SVGAttributes<SVGSVGElement> {
  size?: number;
}

const MoonIcon = forwardRef<SVGSVGElement, MoonIconProps>(
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
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
);

MoonIcon.displayName = "MoonIcon";

export { MoonIcon };
