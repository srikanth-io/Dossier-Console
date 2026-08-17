"use client";

import type { Transition, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { SVGAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";
import { useAnimatedIcon } from "./use-animated-icon";

export interface LayoutListIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface LayoutListIconProps extends SVGAttributes<SVGSVGElement> {
  size?: number;
}

const LINE_TRANSITION: Transition = {
  duration: 0.3,
  ease: "easeInOut",
};

const LINE_VARIANTS: Variants = {
  normal: { x: 0 },
  animate: { x: [0, 3, 0], transition: LINE_TRANSITION },
};

const LayoutListIcon = forwardRef<LayoutListIconHandle, LayoutListIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 24, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<SVGSVGElement>) => {
        if (isControlledRef.current) onMouseEnter?.(e);
        else controls.start("animate");
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<SVGSVGElement>) => {
        if (isControlledRef.current) onMouseLeave?.(e);
        else controls.start("normal");
      },
      [controls, onMouseLeave]
    );

    const svgRef = useAnimatedIcon(handleMouseEnter, handleMouseLeave);

    return (
      <svg
        className={cn(className)}
        ref={svgRef}
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
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <motion.path
          animate={controls}
          initial="normal"
          variants={LINE_VARIANTS}
          d="M9 3v18"
        />
      </svg>
    );
  }
);

LayoutListIcon.displayName = "LayoutListIcon";

export { LayoutListIcon };
