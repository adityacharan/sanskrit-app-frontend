"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Transition,
} from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { speak } from "@/lib/speak";

// Springs, in Apple's terms: critically damped (bounce 0) by default.
// "duration" here is the spring's perceived response, not a fixed timeline.
export const spring: Transition = { type: "spring", bounce: 0, duration: 0.35 };
export const snappy: Transition = { type: "spring", bounce: 0, duration: 0.22 };
// Physical spring for pointer-following values (stiffness 400 / damping 40 ≈ damping ratio 1.0).
const follow = { stiffness: 400, damping: 40 };

// Apple's momentum projection: where a flick would come to rest.
export const project = (velocity: number, decelerationRate = 0.998) =>
  ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);

export function PageHeader({ deva, title, subtitle }: { deva: string; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <p className="deva text-lg text-accent">{deva}</p>
      <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>
    </div>
  );
}

export function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={`Listen to ${text}`}
      title="Listen"
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-base hover:border-accent hover:text-accent ${className}`}
    >
      🔊
    </button>
  );
}

/* ------------------------------------------------------------------ Tabs */

// Segmented control: a selection pill that springs to the active option, and a
// hover pill that glides under the cursor as it moves across options.
export function Tabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode }[];
}) {
  const id = useId();
  const [hovered, setHovered] = useState<T | null>(null);
  const pointerType = useRef("");

  return (
    <div
      role="tablist"
      className="inline-flex max-w-full flex-wrap gap-1 rounded-[1.25rem] bg-surface-2 p-1"
      onPointerLeave={() => setHovered(null)}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            // Mouse commits on press, like a native segmented control; touch waits
            // for a tap so starting a scroll on a tab doesn't select it.
            onPointerDown={(e) => {
              pointerType.current = e.pointerType;
              if (e.pointerType === "mouse" && e.button === 0) onChange(o.value);
            }}
            onClick={() => pointerType.current !== "mouse" && onChange(o.value)}
            onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(o.value)}
            className={`relative rounded-2xl px-4 py-1.5 text-sm ${active ? "font-medium text-ink" : "text-muted hover:text-ink"}`}
          >
            <AnimatePresence>
              {hovered === o.value && !active && (
                <motion.span
                  layoutId={`${id}-hover`}
                  className="absolute inset-0 rounded-2xl bg-surface/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={snappy}
                />
              )}
            </AnimatePresence>
            {active && (
              <motion.span
                layoutId={`${id}-active`}
                className="absolute inset-0 rounded-2xl bg-surface shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.04)]"
                transition={spring}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ Dropdown */

export type DropdownItem = {
  key: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  selected?: boolean;
  danger?: boolean;
};

// A menu that opens on press, grows out of its trigger, and lets the highlight
// glide under the cursor. Supports press-drag-release selection (macOS style)
// and full keyboard control.
export function Dropdown({
  trigger,
  items,
  onSelect,
  align = "start",
  label,
  header,
  triggerClassName = "",
  kind = "listbox",
}: {
  trigger: (open: boolean) => React.ReactNode;
  items: DropdownItem[];
  onSelect: (key: string) => void;
  align?: "start" | "end";
  label: string;
  header?: React.ReactNode;
  triggerClassName?: string;
  /** "listbox" picks a value; "menu" runs actions. */
  kind?: "listbox" | "menu";
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pointerType = useRef("");

  const openMenu = () => {
    setActive(Math.max(0, items.findIndex((i) => i.selected)));
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setActive(-1);
  };
  const choose = (key: string) => {
    onSelect(key);
    close();
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + items.length) % items.length);
    } else if ((e.key === "Enter" || e.key === " ") && active >= 0) {
      e.preventDefault();
      choose(items[active].key);
    } else if (e.key === "Tab") {
      close();
    }
  };

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup={kind}
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        aria-label={label}
        aria-activedescendant={open && active >= 0 ? `${id}-item-${active}` : undefined}
        // Mouse opens on press (no waiting for release); touch/keyboard use click.
        onPointerDown={(e) => {
          pointerType.current = e.pointerType;
          if (e.pointerType === "mouse" && e.button === 0) (open ? close : openMenu)();
        }}
        onClick={(e) => {
          if (e.detail === 0 || pointerType.current !== "mouse") (open ? close : openMenu)();
          pointerType.current = "";
        }}
        onKeyDown={onKeyDown}
        className={triggerClassName}
      >
        {trigger(open)}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`${id}-menu`}
            role={kind}
            initial={{ opacity: 0, scale: 0.96, y: -6, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, y: -6, filter: "blur(4px)" }}
            transition={snappy}
            style={{ transformOrigin: align === "start" ? "top left" : "top right" }}
            className={`material absolute top-full z-50 mt-2 min-w-full w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-2xl p-1.5 shadow-[0_12px_40px_-8px_rgb(0_0_0/0.25)] ${
              align === "start" ? "left-0" : "right-0"
            }`}
            onPointerLeave={() => setActive(-1)}
          >
            {header}
            {items.map((item, i) => (
              <div
                key={item.key}
                id={`${id}-item-${i}`}
                role={kind === "menu" ? "menuitem" : "option"}
                aria-selected={kind === "menu" ? undefined : !!item.selected}
                onPointerMove={() => active !== i && setActive(i)}
                // Release over an item selects it — including press-drag-release from the trigger.
                onPointerDown={(e) => (pointerType.current = e.pointerType)}
                onPointerUp={(e) => e.pointerType === "mouse" && choose(item.key)}
                onClick={() => pointerType.current !== "mouse" && choose(item.key)}
                className={`relative flex cursor-default select-none items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                  item.danger ? "text-bad" : "text-ink"
                }`}
              >
                {active === i && (
                  <motion.span
                    layoutId={`${id}-highlight`}
                    className={`absolute inset-0 rounded-xl ${item.danger ? "bg-bad-soft" : "bg-accent-soft"}`}
                    transition={snappy}
                  />
                )}
                <span className="relative flex-1">{item.label}</span>
                {item.hint && <span className="relative text-xs text-muted">{item.hint}</span>}
                <span className="relative w-4 text-accent">{item.selected ? "✓" : ""}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      animate={{ rotate: open ? 180 : 0 }}
      transition={spring}
      className="shrink-0 text-muted"
      aria-hidden
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

/* --------------------------------------------------------------- Switch */

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 shrink-0 rounded-full p-0.5 transition-colors duration-200 ${
          checked ? "bg-good" : "bg-line"
        }`}
      >
        <motion.span
          className="block h-5 w-5 rounded-full bg-white shadow-[0_2px_4px_rgb(0_0_0/0.2)]"
          animate={{ x: checked ? 16 : 0 }}
          transition={spring}
        />
      </button>
      {label}
    </label>
  );
}

/* ----------------------------------------------------- Progress & pointer */

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-surface-2 ${className}`}>
      <motion.div
        className="h-full rounded-full bg-accent"
        initial={false}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={spring}
      />
    </div>
  );
}

const finePointer = (e: React.PointerEvent) => e.pointerType === "mouse" || e.pointerType === "pen";

// Tilts toward the cursor in 3D, tracking it continuously; springs home on leave.
export function Tilt({
  children,
  className = "",
  max = 5,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), follow);
  const ry = useSpring(useMotionValue(0), follow);

  return (
    <motion.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (reduce || !finePointer(e)) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * max * 2);
        rx.set(-py * max * 2);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

// Gently pulled toward the cursor while hovered; springs back from wherever it is.
export function Magnetic({
  children,
  className = "",
  strength = 0.25,
  max = 10,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), follow);
  const y = useSpring(useMotionValue(0), follow);
  const clamp = (v: number) => Math.max(-max, Math.min(max, v));

  return (
    <motion.div
      className={className}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce || !finePointer(e)) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set(clamp((e.clientX - (r.left + r.width / 2)) * strength));
        y.set(clamp((e.clientY - (r.top + r.height / 2)) * strength));
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
