"use client";

import type { Transition, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { SVGAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";
import { useAnimatedIcon } from "./use-animated-icon";

export interface SourceIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SourceIconProps extends SVGAttributes<SVGSVGElement> {
  size?: number;
}

const PIPE_TRANSITION: Transition = {
  duration: 0.3,
  ease: "easeInOut",
};

const PIPE_VARIANTS: Variants = {
  normal: { pathLength: 1 },
  animate: { pathLength: [0.3, 1], transition: PIPE_TRANSITION },
};

const SourceIcon = forwardRef<SourceIconHandle, SourceIconProps>(
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
        <motion.path
          animate={controls}
          initial="normal"
          variants={PIPE_VARIANTS}
          d="M12 2v20"
        />
        <motion.path
          animate={controls}
          initial="normal"
          variants={PIPE_VARIANTS}
          d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
        />
      </svg>
    );
  }
);

SourceIcon.displayName = "SourceIcon";

export { SourceIcon };
