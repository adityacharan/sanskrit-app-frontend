"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Dropdown, snappy, spring } from "@/components/ui";
import { allWords } from "@/lib/data";
import { actions, levelFor, useProgress } from "@/lib/progress";
import { logOut } from "@/lib/session";

export const links = [
  { href: "/", label: "Learn", icon: "🗺️" },
  { href: "/alphabet", label: "Alphabet", icon: "अ" },
  { href: "/vocabulary", label: "Words", icon: "📖" },
  { href: "/grammar", label: "Grammar", icon: "📐" },
  { href: "/advanced", label: "Advanced", icon: "🎓" },
  { href: "/phrases", label: "Phrases", icon: "💬" },
];

// Lessons and tests are steps of the map, so they belong to Learn, not to the reference pages.
const IN_A_STEP = ["/vocabulary/lesson", "/quiz"];

export default function Nav() {
  const pathname = usePathname();
  const { xp, streak, learned } = useProgress();
  const { level } = levelFor(xp);
  const [hovered, setHovered] = useState<string | null>(null);

  if (pathname === "/login") return null;
  const inStep = IN_A_STEP.some((p) => pathname.startsWith(p));
  const isActive = (href: string) => (href === "/" ? pathname === "/" || inStep : !inStep && pathname.startsWith(href));

  return (
    <>
      <header className="material-bar sticky top-0 z-30 border-b border-line/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
          <Link href="/" className="deva flex items-center gap-2 text-2xl font-semibold text-accent">
            <Image src="/logo.png" alt="" width={152} height={163} priority className="h-9 w-auto" />
            संस्कृतम्
          </Link>

          <nav className="hidden flex-1 items-center gap-1 md:flex" onPointerLeave={() => setHovered(null)}>
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(l.href)}
                  className={`relative whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${active ? "font-medium text-accent" : "text-muted hover:text-ink"}`}
                >
                  <AnimatePresence>
                    {hovered === l.href && !active && (
                      <motion.span
                        layoutId="nav-hover"
                        className="absolute inset-0 rounded-full bg-surface-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={snappy}
                      />
                    )}
                  </AnimatePresence>
                  {active && (
                    <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-accent-soft" transition={spring} />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 text-sm md:ml-0">
            <span className="hidden whitespace-nowrap rounded-full bg-surface-2 px-2.5 py-1 tabular-nums lg:inline" title="Daily streak">
              🔥 {streak}
            </span>
            <Dropdown
              label="Account menu"
              kind="menu"
              align="end"
              triggerClassName="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-surface-2 py-1 pl-2.5 pr-1 hover:bg-line/60"
              trigger={() => (
                <>
                  <span className="tabular-nums">⭐ {xp}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-ink">
                    {level}
                  </span>
                </>
              )}
              header={
                <div className="mb-1 border-b border-line px-3 pb-2.5 pt-1.5">
                  <p className="font-medium">Level {level}</p>
                  <p className="text-xs text-muted">
                    {xp} XP · {allWords.filter((w) => learned.includes(w.id)).length} words · {streak} day streak
                  </p>
                </div>
              }
              items={[
                { key: "reset", label: "Reset progress", danger: true },
                { key: "logout", label: "Log out" },
              ]}
              onSelect={(key) => {
                if (key === "reset" && window.confirm("Reset all XP and learned words? This can't be undone.")) actions.reset();
                if (key === "logout") {
                  logOut();
                  // Full reload so no cached app pages survive the logout.
                  window.location.assign("/login");
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* Mobile tab bar. Hidden in a lesson, like Duolingo, so the Check button never sits behind it. */}
      {!pathname.startsWith("/vocabulary/lesson") && (
      <nav className="material-bar fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line/60 pb-[env(safe-area-inset-bottom)] md:hidden">
        {links.map((l) => {
          const active = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] ${active ? "text-accent" : "text-muted"}`}
            >
              {active && (
                <motion.span layoutId="tab-active" className="absolute inset-x-2 inset-y-1 rounded-xl bg-accent-soft" transition={spring} />
              )}
              <span className="deva relative text-lg leading-none">{l.icon}</span>
              <span className="relative">{l.label}</span>
            </Link>
          );
        })}
      </nav>
      )}
    </>
  );
}
