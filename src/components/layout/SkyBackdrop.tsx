"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import milkyWay from "@/assets/sky/milky-way.jpg";

/**
 * Fixed starfield behind the instrument. The layer drifts a few percent of
 * the viewport over the full page so the sky reads as much farther away than
 * the content scrolling over it. Decorative only: hidden from assistive tech,
 * and frozen when the visitor prefers reduced motion.
 */
export function SkyBackdrop() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;

      if (motionQuery.matches) {
        layer.style.setProperty("--sky-shift", "0px");
        layer.style.setProperty("--sky-zoom", "0");
        return;
      }

      const viewport = window.innerHeight;
      const scrollable = Math.max(
        1,
        document.documentElement.scrollHeight - viewport,
      );
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));

      // Keep the movement inside the bleed created by the CSS scale, so no
      // edge of the photograph is ever exposed on a tall page.
      layer.style.setProperty("--sky-shift", `${(progress * viewport * 0.07).toFixed(2)}px`);
      layer.style.setProperty("--sky-zoom", (progress * 0.04).toFixed(4));
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const onMotionChange = () => {
      if (motionQuery.matches) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
      }
      update();
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div aria-hidden="true" className="sky-backdrop" ref={layerRef}>
      <Image
        alt=""
        className="sky-backdrop-image"
        fill
        placeholder="blur"
        preload
        sizes="100vw"
        src={milkyWay}
      />
    </div>
  );
}
