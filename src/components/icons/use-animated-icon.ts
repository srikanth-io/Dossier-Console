"use client";

import { useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

type HoverHandler = (e: ReactMouseEvent<SVGSVGElement>) => void;

/**
 * Drives an icon's animation from the hover state of the element that contains
 * it (its parent) instead of the hover state of the svg itself. Hovering
 * anywhere on the parent element now triggers the icon's animation handlers.
 */
export function useAnimatedIcon(
  onMouseEnter?: HoverHandler,
  onMouseLeave?: HoverHandler
) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const host = svgRef.current?.parentElement;
    if (!host) return;

    const handleMouseEnter = (e: MouseEvent) =>
      onMouseEnter?.(e as unknown as ReactMouseEvent<SVGSVGElement>);
    const handleMouseLeave = (e: MouseEvent) =>
      onMouseLeave?.(e as unknown as ReactMouseEvent<SVGSVGElement>);

    host.addEventListener("mouseenter", handleMouseEnter);
    host.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      host.removeEventListener("mouseenter", handleMouseEnter);
      host.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [onMouseEnter, onMouseLeave]);

  return svgRef;
}
