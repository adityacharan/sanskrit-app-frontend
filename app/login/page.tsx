"use client";

import { Great_Vibes } from "next/font/google";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Magnetic, spring, Tilt } from "@/components/ui";

const signature = Great_Vibes({ weight: "400", subsets: ["latin"] });

// Content rises in, one beat after another.
const rise = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { ...spring, duration: 0.6, delay: 0.06 * i },
});

// Dummy login — no credentials, the button just enters the app.
export default function LoginPage() {
  const router = useRouter();
  const reduce = useReducedMotion();

  // Pointer position, normalised to -0.5…0.5 and smoothed with a critically damped spring.
  const px = useSpring(useMotionValue(0), { stiffness: 120, damping: 22 });
  const py = useSpring(useMotionValue(0), { stiffness: 120, damping: 22 });
  // Background glyphs drift against the cursor at different depths.
  const farX = useTransform(px, (v) => v * -40);
  const farY = useTransform(py, (v) => v * -40);
  const nearX = useTransform(px, (v) => v * 24);
  const nearY = useTransform(py, (v) => v * 24);

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-between overflow-y-auto bg-bg px-4 py-10"
      onPointerMove={(e) => {
        if (reduce || e.pointerType === "touch") return;
        px.set(e.clientX / window.innerWidth - 0.5);
        py.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.span
          style={{ x: farX, y: farY }}
          className="deva absolute -right-16 -top-24 select-none text-[22rem] leading-none text-accent opacity-[0.06]"
        >
          ॐ
        </motion.span>
        <motion.span
          style={{ x: nearX, y: nearY }}
          className="deva absolute -bottom-32 -left-16 select-none text-[20rem] leading-none text-accent opacity-[0.05]"
        >
          अ
        </motion.span>
      </div>

      <div />

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <motion.div {...rise(0)}>
          <Tilt max={12}>
            <div
              data-spotlight="light"
              className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-accent shadow-lg shadow-accent/25"
            >
              <span className="deva text-5xl leading-none text-accent-ink">सं</span>
            </div>
          </Tilt>
        </motion.div>
        <motion.h1 {...rise(1)} className="mt-6 text-4xl font-semibold tracking-[-0.025em] sm:text-5xl">
          Learn <span className="text-accent">Sanskrit</span>
        </motion.h1>
        <motion.p {...rise(2)} className="deva mt-2 text-xl text-muted">
          संस्कृतं पठतु
        </motion.p>
        <motion.p {...rise(3)} className="mt-4 text-muted">
          From simple letters to beautiful poems, one step at a time.
        </motion.p>

        <motion.div {...rise(4)} className="mt-10 w-full">
          <Magnetic strength={0.15} max={6}>
            <button
              type="button"
              onClick={() => router.push("/")}
              data-spotlight="light"
              className="w-full rounded-full bg-accent py-3.5 text-lg font-medium text-accent-ink shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30"
            >
              Login
            </button>
          </Magnetic>
        </motion.div>
      </div>

      <motion.footer {...rise(6)} className="relative mt-12 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">An initiative by</p>
        <p className={`${signature.className} mt-1 text-5xl text-ink`}>Jaganmohini</p>
      </motion.footer>
    </div>
  );
}
