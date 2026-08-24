"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { SVGAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";
import { useAnimatedIcon } from "./use-animated-icon";

export interface CameraIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CameraIconProps extends SVGAttributes<SVGSVGElement> {
  size?: number;
}

const LENS_VARIANTS: Variants = {
  normal: { scale: 1 },
  animate: {
    scale: 1.15,
    transition: {
      type: "spring",
      stiffness: 250,
      damping: 12,
      mass: 1,
    },
  },
};

const CameraIcon = forwardRef<CameraIconHandle, CameraIconProps>(
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
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<SVGSVGElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("normal");
        }
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
          <path d="M14.5 4h-5L7.7 6.2a1 1 0 0 1-.8.4H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.6a2 2 0 0 0-2-2h-2.9a1 1 0 0 1-.8-.4z" />
          <motion.circle
            animate={controls}
            variants={LENS_VARIANTS}
            style={{ transformOrigin: "center" }}
            cx="12"
            cy="13"
            r="3"
          />
        </svg>
    );
  }
);

CameraIcon.displayName = "CameraIcon";

export { CameraIcon };
