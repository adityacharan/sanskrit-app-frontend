"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Dropdown, snappy, spring } from "@/components/ui";
import { actions, levelFor, useProgress } from "@/lib/progress";
import { logOut } from "@/lib/session";

export const links = [
  { href: "/", label: "Home", deva: "गृहम्", icon: "🏠" },
  { href: "/alphabet", label: "Alphabet", deva: "वर्णमाला", icon: "अ" },
  { href: "/vocabulary", label: "Words", deva: "शब्दाः", icon: "📖" },
  { href: "/quiz", label: "Quiz", deva: "परीक्षा", icon: "🎯" },
  { href: "/grammar", label: "Grammar", deva: "व्याकरणम्", icon: "📐" },
  { href: "/phrases", label: "Phrases", deva: "वाक्यानि", icon: "💬" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { xp, streak, learned } = useProgress();
  const { level } = levelFor(xp);
  const [hovered, setHovered] = useState<string | null>(null);

  if (pathname === "/login") return null;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className="material-bar sticky top-0 z-30 border-b border-line/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
          <Link href="/" className="deva text-2xl font-semibold text-accent">
            संस्कृतम्
          </Link>

          <nav className="hidden flex-1 items-center gap-1 sm:flex" onPointerLeave={() => setHovered(null)}>
            {links.slice(1).map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(l.href)}
                  className={`relative rounded-full px-3 py-1.5 text-sm ${active ? "font-medium text-accent" : "text-muted hover:text-ink"}`}
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

          <div className="ml-auto flex items-center gap-2 text-sm sm:ml-0">
            <span className="hidden rounded-full bg-surface-2 px-2.5 py-1 tabular-nums sm:inline" title="Daily streak">
              🔥 {streak}
            </span>
            <Dropdown
              label="Account menu"
              kind="menu"
              align="end"
              triggerClassName="flex items-center gap-2 rounded-full bg-surface-2 py-1 pl-2.5 pr-1 hover:bg-line/60"
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
                    {xp} XP · {learned.length} words · {streak} day streak
                  </p>
                </div>
              }
              items={[
                { key: "home", label: "Dashboard" },
                { key: "reset", label: "Reset progress", danger: true },
                { key: "logout", label: "Log out" },
              ]}
              onSelect={(key) => {
                if (key === "home") router.push("/");
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

      {/* Mobile tab bar */}
      <nav className="material-bar fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line/60 pb-[env(safe-area-inset-bottom)] sm:hidden">
        {links.map((l) => {
          const active = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] ${active ? "text-accent" : "text-muted"}`}
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
    </>
  );
}
