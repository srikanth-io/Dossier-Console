"use client";

import type { Transition, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { SVGAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";
import { useAnimatedIcon } from "./use-animated-icon";

export interface PlugIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface PlugIconProps extends SVGAttributes<SVGSVGElement> {
  size?: number;
}

const PLUG_TRANSITION: Transition = {
  duration: 0.3,
  ease: "easeInOut",
};

const PLUG_VARIANTS: Variants = {
  normal: { y: 0 },
  animate: { y: [0, -3, 0], transition: PLUG_TRANSITION },
};

const PlugIcon = forwardRef<PlugIconHandle, PlugIconProps>(
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
        <motion.g
          animate={controls}
          initial="normal"
          variants={PLUG_VARIANTS}
        >
          <path d="M12 22v-5" />
          <path d="M9 8V2" />
          <path d="M15 8V2" />
          <path d="M18 8v5a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6V8Z" />
        </motion.g>
      </svg>
    );
  }
);

PlugIcon.displayName = "PlugIcon";

export { PlugIcon };
