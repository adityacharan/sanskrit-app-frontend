"use client";

import { MotionConfig } from "motion/react";
import { useEffect } from "react";

// One passive listener drives every [data-spotlight] surface: the pointer's
// position is written into CSS variables on each move, with no React renders.
function usePointerSpotlight() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-spotlight]") ?? null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
}

export default function Providers({ children }: { children: React.ReactNode }) {
  usePointerSpotlight();
  // reducedMotion="user": springs become instant when the OS asks for less motion.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
